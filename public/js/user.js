(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var cs = require('../../helpers/cs');
var schemas = require('../../schemas');
var server = require('../../server');
var states = {
	GLOBAL: 'GLOBAL',
	SIZE: 'SIZE',
	CONTENT: 'CONTENT',
	SMALL: 'SMALL',
	BIG: 'BIG',
	LOGIN: 'LOGIN',
	REGISTER: 'REGISTER',
	DETAILS: 'DETAILS'
};
var contents = {
	LOGIN: 'LOGIN',
	REGISTER: 'REGISTER',
	DETAILS: 'DETAILS'
};
var stateChart = Stativus.createStatechart();

var User = React.createClass({
	displayName: 'User',

	getInitialState: function getInitialState() {
		var user = schemas.user.blank();

		return {
			status: 'GUEST',
			userName: user.name,
			opened: false,
			content: contents.LOGIN,
			errorMessage: ''
		};
	},
	componentDidMount: function componentDidMount() {
		var _this = this;

		stateChart.addState(states.GLOBAL, {
			substatesAreConcurrent: true,
			states: [{
				name: states.SIZE,
				initialSubstate: states.SMALL,
				states: [{
					name: states.SMALL,
					enterState: function enterState() {
						_this.setState({ opened: false });
					},
					toggleSize: function toggleSize() {
						this.goToState(states.BIG);
					}
				}, {
					name: states.BIG,
					enterState: function enterState() {
						_this.setState({ opened: true });
					},
					toggleSize: function toggleSize() {
						this.goToState(states.SMALL);
					}
				}]
			}, {
				name: states.CONTENT,
				initialSubstate: states.LOGIN,
				states: [{
					name: states.LOGIN,
					enterState: function enterState() {
						_this.setState({ content: contents.LOGIN });
					},
					loginSuccess: function loginSuccess() {
						this.goToState(states.DETAILS);
					}
				}, {
					name: states.REGISTER,
					enterState: function enterState() {
						_this.setState({ content: contents.REGISTER });
					}
				}, {
					name: states.DETAILS,
					enterState: function enterState() {
						_this.setState({
							content: contents.DETAILS,
							userName: bella.data.user.get().name
						});
					}
				}]
			}]
		});

		stateChart.initStates(states.GLOBAL);

		bella.data.user.subscribe(function (user) {
			switch (user.status) {
				case bella.constants.userStatus.LOGGED_IN:
					stateChart.sendEvent('loginSuccess', user);
					break;
				case bella.constants.userStatus.GUEST:
					stateChart.sendEvent('logoutSuccess');
					break;
			}
		});

		if (cs.cookie('user_id', document.cookie) && cs.cookie('token', document.cookie)) {
			server.userStatus.get(function (result, userStatus) {
				bella.data.user.set(userStatus, _this);
			});
		} else {
			bella.data.user.set('status', bella.constants.userStatus.GUEST, this);
		}
	},
	render: function render() {
		var content, display, errorMessage;

		if (this.state.opened) {
			switch (this.state.content) {
				case contents.LOGIN:
					content = React.createElement(
						'div',
						{ className: 'bc-user-popup' },
						errorMessage,
						React.createElement('input', { type: 'text', ref: 'name', defaultValue: 'a' }),
						React.createElement('br', null),
						React.createElement('input', { type: 'text', ref: 'password', defaultValue: '1' }),
						React.createElement('br', null),
						React.createElement(
							'button',
							{ onClick: this.login },
							'Login'
						),
						React.createElement('br', null),
						React.createElement(
							'a',
							{ href: '', onClick: this.register },
							'register'
						)
					);
					break;
				case contents.REGISTER:
					content = React.createElement(
						'div',
						{ className: 'bc-user-popup' },
						React.createElement(
							'span',
							null,
							'registration form...'
						)
					);
					break;
				case contents.DETAILS:
					content = React.createElement(
						'div',
						null,
						'user details...'
					);
					break;
			}
		}

		switch (this.state.content) {
			case contents.LOGIN:
			case contents.REGISTER:
				display = React.createElement(
					'a',
					{ href: '', onClick: this.toggleSize },
					'login/register'
				);
				break;
			case contents.DETAILS:
				display = React.createElement(
					'a',
					{ href: '', onClick: this.toggleSize },
					'user'
				);
				break;
		}

		return React.createElement(
			'div',
			{ className: 'bc-user' },
			React.createElement(
				'span',
				null,
				'U ',
				display
			),
			content
		);
	},
	toggleSize: function toggleSize(e) {
		e.preventDefault();
		stateChart.sendEvent('toggleSize');
	},
	login: function login() {
		var _this2 = this;

		server.login({
			username: this.refs.name.value,
			password: this.refs.password.value
		}, function (result, data) {
			if (result.success) {
				bella.data.user.set(data, _this2);
				_this2.setState({ errorMessage: '' });
			} else {
				_this2.setState({ errorMessage: 'Wrong username or password' });
			}
		});
	},
	logout: function logout(e) {
		var _this3 = this;

		e.preventDefault();
		server.logout(function (result) {
			if (result.success) {
				bella.data.user.set(schemas.user.blank(), _this3);
				_this3.setState({ opened: false });
			}
		});
	},
	register: function register(e) {
		e.preventDefault();
	}
});

ReactDOM.render(React.createElement(User, null), document.getElementById('bc-user-container'));
},{"../../helpers/cs":6,"../../schemas":7,"../../server":8}],2:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjL3NjcmlwdHMvY29tcG9uZW50cy91c2VyL3VzZXIuanMiLCJub2RlX21vZHVsZXMvYnJvd3NlcmlmeS9ub2RlX21vZHVsZXMvcHJvY2Vzcy9icm93c2VyLmpzIiwibm9kZV9tb2R1bGVzL3NjaGVtYS1pbnNwZWN0b3IvaW5kZXguanMiLCJub2RlX21vZHVsZXMvc2NoZW1hLWluc3BlY3Rvci9saWIvc2NoZW1hLWluc3BlY3Rvci5qcyIsIm5vZGVfbW9kdWxlcy9zY2hlbWEtaW5zcGVjdG9yL25vZGVfbW9kdWxlcy9hc3luYy9saWIvYXN5bmMuanMiLCJzcmMvc2NyaXB0cy9oZWxwZXJzL2NzLmpzIiwic3JjL3NjcmlwdHMvc2NoZW1hcy5qcyIsInNyYy9zY3JpcHRzL3NlcnZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7O0FDREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RpREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3B2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcyA9IHJlcXVpcmUoJy4uLy4uL2hlbHBlcnMvY3MnKTtcbnZhciBzY2hlbWFzID0gcmVxdWlyZSgnLi4vLi4vc2NoZW1hcycpO1xudmFyIHNlcnZlciA9IHJlcXVpcmUoJy4uLy4uL3NlcnZlcicpO1xudmFyIHN0YXRlcyA9IHtcblx0R0xPQkFMOiAnR0xPQkFMJyxcblx0U0laRTogJ1NJWkUnLFxuXHRDT05URU5UOiAnQ09OVEVOVCcsXG5cdFNNQUxMOiAnU01BTEwnLFxuXHRCSUc6ICdCSUcnLFxuXHRMT0dJTjogJ0xPR0lOJyxcblx0UkVHSVNURVI6ICdSRUdJU1RFUicsXG5cdERFVEFJTFM6ICdERVRBSUxTJ1xufTtcbnZhciBjb250ZW50cyA9IHtcblx0TE9HSU46ICdMT0dJTicsXG5cdFJFR0lTVEVSOiAnUkVHSVNURVInLFxuXHRERVRBSUxTOiAnREVUQUlMUydcbn07XG52YXIgc3RhdGVDaGFydCA9IFN0YXRpdnVzLmNyZWF0ZVN0YXRlY2hhcnQoKTtcblxudmFyIFVzZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnVXNlcicsXG5cblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG5cdFx0dmFyIHVzZXIgPSBzY2hlbWFzLnVzZXIuYmxhbmsoKTtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRzdGF0dXM6ICdHVUVTVCcsXG5cdFx0XHR1c2VyTmFtZTogdXNlci5uYW1lLFxuXHRcdFx0b3BlbmVkOiBmYWxzZSxcblx0XHRcdGNvbnRlbnQ6IGNvbnRlbnRzLkxPR0lOLFxuXHRcdFx0ZXJyb3JNZXNzYWdlOiAnJ1xuXHRcdH07XG5cdH0sXG5cdGNvbXBvbmVudERpZE1vdW50OiBmdW5jdGlvbiBjb21wb25lbnREaWRNb3VudCgpIHtcblx0XHR2YXIgX3RoaXMgPSB0aGlzO1xuXG5cdFx0c3RhdGVDaGFydC5hZGRTdGF0ZShzdGF0ZXMuR0xPQkFMLCB7XG5cdFx0XHRzdWJzdGF0ZXNBcmVDb25jdXJyZW50OiB0cnVlLFxuXHRcdFx0c3RhdGVzOiBbe1xuXHRcdFx0XHRuYW1lOiBzdGF0ZXMuU0laRSxcblx0XHRcdFx0aW5pdGlhbFN1YnN0YXRlOiBzdGF0ZXMuU01BTEwsXG5cdFx0XHRcdHN0YXRlczogW3tcblx0XHRcdFx0XHRuYW1lOiBzdGF0ZXMuU01BTEwsXG5cdFx0XHRcdFx0ZW50ZXJTdGF0ZTogZnVuY3Rpb24gZW50ZXJTdGF0ZSgpIHtcblx0XHRcdFx0XHRcdF90aGlzLnNldFN0YXRlKHsgb3BlbmVkOiBmYWxzZSB9KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHRvZ2dsZVNpemU6IGZ1bmN0aW9uIHRvZ2dsZVNpemUoKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmdvVG9TdGF0ZShzdGF0ZXMuQklHKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRuYW1lOiBzdGF0ZXMuQklHLFxuXHRcdFx0XHRcdGVudGVyU3RhdGU6IGZ1bmN0aW9uIGVudGVyU3RhdGUoKSB7XG5cdFx0XHRcdFx0XHRfdGhpcy5zZXRTdGF0ZSh7IG9wZW5lZDogdHJ1ZSB9KTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHRvZ2dsZVNpemU6IGZ1bmN0aW9uIHRvZ2dsZVNpemUoKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmdvVG9TdGF0ZShzdGF0ZXMuU01BTEwpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fV1cblx0XHRcdH0sIHtcblx0XHRcdFx0bmFtZTogc3RhdGVzLkNPTlRFTlQsXG5cdFx0XHRcdGluaXRpYWxTdWJzdGF0ZTogc3RhdGVzLkxPR0lOLFxuXHRcdFx0XHRzdGF0ZXM6IFt7XG5cdFx0XHRcdFx0bmFtZTogc3RhdGVzLkxPR0lOLFxuXHRcdFx0XHRcdGVudGVyU3RhdGU6IGZ1bmN0aW9uIGVudGVyU3RhdGUoKSB7XG5cdFx0XHRcdFx0XHRfdGhpcy5zZXRTdGF0ZSh7IGNvbnRlbnQ6IGNvbnRlbnRzLkxPR0lOIH0pO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bG9naW5TdWNjZXNzOiBmdW5jdGlvbiBsb2dpblN1Y2Nlc3MoKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmdvVG9TdGF0ZShzdGF0ZXMuREVUQUlMUyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0bmFtZTogc3RhdGVzLlJFR0lTVEVSLFxuXHRcdFx0XHRcdGVudGVyU3RhdGU6IGZ1bmN0aW9uIGVudGVyU3RhdGUoKSB7XG5cdFx0XHRcdFx0XHRfdGhpcy5zZXRTdGF0ZSh7IGNvbnRlbnQ6IGNvbnRlbnRzLlJFR0lTVEVSIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdG5hbWU6IHN0YXRlcy5ERVRBSUxTLFxuXHRcdFx0XHRcdGVudGVyU3RhdGU6IGZ1bmN0aW9uIGVudGVyU3RhdGUoKSB7XG5cdFx0XHRcdFx0XHRfdGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0XHRcdGNvbnRlbnQ6IGNvbnRlbnRzLkRFVEFJTFMsXG5cdFx0XHRcdFx0XHRcdHVzZXJOYW1lOiBiZWxsYS5kYXRhLnVzZXIuZ2V0KCkubmFtZVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XVxuXHRcdFx0fV1cblx0XHR9KTtcblxuXHRcdHN0YXRlQ2hhcnQuaW5pdFN0YXRlcyhzdGF0ZXMuR0xPQkFMKTtcblxuXHRcdGJlbGxhLmRhdGEudXNlci5zdWJzY3JpYmUoZnVuY3Rpb24gKHVzZXIpIHtcblx0XHRcdHN3aXRjaCAodXNlci5zdGF0dXMpIHtcblx0XHRcdFx0Y2FzZSBiZWxsYS5jb25zdGFudHMudXNlclN0YXR1cy5MT0dHRURfSU46XG5cdFx0XHRcdFx0c3RhdGVDaGFydC5zZW5kRXZlbnQoJ2xvZ2luU3VjY2VzcycsIHVzZXIpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIGJlbGxhLmNvbnN0YW50cy51c2VyU3RhdHVzLkdVRVNUOlxuXHRcdFx0XHRcdHN0YXRlQ2hhcnQuc2VuZEV2ZW50KCdsb2dvdXRTdWNjZXNzJyk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHRpZiAoY3MuY29va2llKCd1c2VyX2lkJywgZG9jdW1lbnQuY29va2llKSAmJiBjcy5jb29raWUoJ3Rva2VuJywgZG9jdW1lbnQuY29va2llKSkge1xuXHRcdFx0c2VydmVyLnVzZXJTdGF0dXMuZ2V0KGZ1bmN0aW9uIChyZXN1bHQsIHVzZXJTdGF0dXMpIHtcblx0XHRcdFx0YmVsbGEuZGF0YS51c2VyLnNldCh1c2VyU3RhdHVzLCBfdGhpcyk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YmVsbGEuZGF0YS51c2VyLnNldCgnc3RhdHVzJywgYmVsbGEuY29uc3RhbnRzLnVzZXJTdGF0dXMuR1VFU1QsIHRoaXMpO1xuXHRcdH1cblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIGNvbnRlbnQsIGRpc3BsYXksIGVycm9yTWVzc2FnZTtcblxuXHRcdGlmICh0aGlzLnN0YXRlLm9wZW5lZCkge1xuXHRcdFx0c3dpdGNoICh0aGlzLnN0YXRlLmNvbnRlbnQpIHtcblx0XHRcdFx0Y2FzZSBjb250ZW50cy5MT0dJTjpcblx0XHRcdFx0XHRjb250ZW50ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRcdFx0eyBjbGFzc05hbWU6ICdiYy11c2VyLXBvcHVwJyB9LFxuXHRcdFx0XHRcdFx0ZXJyb3JNZXNzYWdlLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7IHR5cGU6ICd0ZXh0JywgcmVmOiAnbmFtZScsIGRlZmF1bHRWYWx1ZTogJ2EnIH0pLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudCgnYnInLCBudWxsKSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JywgeyB0eXBlOiAndGV4dCcsIHJlZjogJ3Bhc3N3b3JkJywgZGVmYXVsdFZhbHVlOiAnMScgfSksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KCdicicsIG51bGwpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J2J1dHRvbicsXG5cdFx0XHRcdFx0XHRcdHsgb25DbGljazogdGhpcy5sb2dpbiB9LFxuXHRcdFx0XHRcdFx0XHQnTG9naW4nXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudCgnYnInLCBudWxsKSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCdhJyxcblx0XHRcdFx0XHRcdFx0eyBocmVmOiAnJywgb25DbGljazogdGhpcy5yZWdpc3RlciB9LFxuXHRcdFx0XHRcdFx0XHQncmVnaXN0ZXInXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBjb250ZW50cy5SRUdJU1RFUjpcblx0XHRcdFx0XHRjb250ZW50ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRcdFx0eyBjbGFzc05hbWU6ICdiYy11c2VyLXBvcHVwJyB9LFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHQncmVnaXN0cmF0aW9uIGZvcm0uLi4nXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBjb250ZW50cy5ERVRBSUxTOlxuXHRcdFx0XHRcdGNvbnRlbnQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0J3VzZXIgZGV0YWlscy4uLidcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHN3aXRjaCAodGhpcy5zdGF0ZS5jb250ZW50KSB7XG5cdFx0XHRjYXNlIGNvbnRlbnRzLkxPR0lOOlxuXHRcdFx0Y2FzZSBjb250ZW50cy5SRUdJU1RFUjpcblx0XHRcdFx0ZGlzcGxheSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J2EnLFxuXHRcdFx0XHRcdHsgaHJlZjogJycsIG9uQ2xpY2s6IHRoaXMudG9nZ2xlU2l6ZSB9LFxuXHRcdFx0XHRcdCdsb2dpbi9yZWdpc3Rlcidcblx0XHRcdFx0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIGNvbnRlbnRzLkRFVEFJTFM6XG5cdFx0XHRcdGRpc3BsYXkgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdhJyxcblx0XHRcdFx0XHR7IGhyZWY6ICcnLCBvbkNsaWNrOiB0aGlzLnRvZ2dsZVNpemUgfSxcblx0XHRcdFx0XHQndXNlcidcblx0XHRcdFx0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnZGl2Jyxcblx0XHRcdHsgY2xhc3NOYW1lOiAnYmMtdXNlcicgfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdzcGFuJyxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0J1UgJyxcblx0XHRcdFx0ZGlzcGxheVxuXHRcdFx0KSxcblx0XHRcdGNvbnRlbnRcblx0XHQpO1xuXHR9LFxuXHR0b2dnbGVTaXplOiBmdW5jdGlvbiB0b2dnbGVTaXplKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0c3RhdGVDaGFydC5zZW5kRXZlbnQoJ3RvZ2dsZVNpemUnKTtcblx0fSxcblx0bG9naW46IGZ1bmN0aW9uIGxvZ2luKCkge1xuXHRcdHZhciBfdGhpczIgPSB0aGlzO1xuXG5cdFx0c2VydmVyLmxvZ2luKHtcblx0XHRcdHVzZXJuYW1lOiB0aGlzLnJlZnMubmFtZS52YWx1ZSxcblx0XHRcdHBhc3N3b3JkOiB0aGlzLnJlZnMucGFzc3dvcmQudmFsdWVcblx0XHR9LCBmdW5jdGlvbiAocmVzdWx0LCBkYXRhKSB7XG5cdFx0XHRpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcblx0XHRcdFx0YmVsbGEuZGF0YS51c2VyLnNldChkYXRhLCBfdGhpczIpO1xuXHRcdFx0XHRfdGhpczIuc2V0U3RhdGUoeyBlcnJvck1lc3NhZ2U6ICcnIH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0X3RoaXMyLnNldFN0YXRlKHsgZXJyb3JNZXNzYWdlOiAnV3JvbmcgdXNlcm5hbWUgb3IgcGFzc3dvcmQnIH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRsb2dvdXQ6IGZ1bmN0aW9uIGxvZ291dChlKSB7XG5cdFx0dmFyIF90aGlzMyA9IHRoaXM7XG5cblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdFx0c2VydmVyLmxvZ291dChmdW5jdGlvbiAocmVzdWx0KSB7XG5cdFx0XHRpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcblx0XHRcdFx0YmVsbGEuZGF0YS51c2VyLnNldChzY2hlbWFzLnVzZXIuYmxhbmsoKSwgX3RoaXMzKTtcblx0XHRcdFx0X3RoaXMzLnNldFN0YXRlKHsgb3BlbmVkOiBmYWxzZSB9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0cmVnaXN0ZXI6IGZ1bmN0aW9uIHJlZ2lzdGVyKGUpIHtcblx0XHRlLnByZXZlbnREZWZhdWx0KCk7XG5cdH1cbn0pO1xuXG5SZWFjdERPTS5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChVc2VyLCBudWxsKSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2JjLXVzZXItY29udGFpbmVyJykpOyIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xuXG5mdW5jdGlvbiBkcmFpblF1ZXVlKCkge1xuICAgIGlmIChkcmFpbmluZykge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuICAgIGRyYWluaW5nID0gdHJ1ZTtcbiAgICB2YXIgY3VycmVudFF1ZXVlO1xuICAgIHZhciBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgd2hpbGUobGVuKSB7XG4gICAgICAgIGN1cnJlbnRRdWV1ZSA9IHF1ZXVlO1xuICAgICAgICBxdWV1ZSA9IFtdO1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB3aGlsZSAoKytpIDwgbGVuKSB7XG4gICAgICAgICAgICBjdXJyZW50UXVldWVbaV0oKTtcbiAgICAgICAgfVxuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGRyYWluaW5nID0gZmFsc2U7XG59XG5wcm9jZXNzLm5leHRUaWNrID0gZnVuY3Rpb24gKGZ1bikge1xuICAgIHF1ZXVlLnB1c2goZnVuKTtcbiAgICBpZiAoIWRyYWluaW5nKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZHJhaW5RdWV1ZSwgMCk7XG4gICAgfVxufTtcblxucHJvY2Vzcy50aXRsZSA9ICdicm93c2VyJztcbnByb2Nlc3MuYnJvd3NlciA9IHRydWU7XG5wcm9jZXNzLmVudiA9IHt9O1xucHJvY2Vzcy5hcmd2ID0gW107XG5wcm9jZXNzLnZlcnNpb24gPSAnJzsgLy8gZW1wdHkgc3RyaW5nIHRvIGF2b2lkIHJlZ2V4cCBpc3N1ZXNcbnByb2Nlc3MudmVyc2lvbnMgPSB7fTtcblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnByb2Nlc3Mub24gPSBub29wO1xucHJvY2Vzcy5hZGRMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLm9uY2UgPSBub29wO1xucHJvY2Vzcy5vZmYgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVMaXN0ZW5lciA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUFsbExpc3RlbmVycyA9IG5vb3A7XG5wcm9jZXNzLmVtaXQgPSBub29wO1xuXG5wcm9jZXNzLmJpbmRpbmcgPSBmdW5jdGlvbiAobmFtZSkge1xuICAgIHRocm93IG5ldyBFcnJvcigncHJvY2Vzcy5iaW5kaW5nIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5cbi8vIFRPRE8oc2h0eWxtYW4pXG5wcm9jZXNzLmN3ZCA9IGZ1bmN0aW9uICgpIHsgcmV0dXJuICcvJyB9O1xucHJvY2Vzcy5jaGRpciA9IGZ1bmN0aW9uIChkaXIpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuY2hkaXIgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcbnByb2Nlc3MudW1hc2sgPSBmdW5jdGlvbigpIHsgcmV0dXJuIDA7IH07XG4iLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoJy4vbGliL3NjaGVtYS1pbnNwZWN0b3InKTtcbiIsIi8qXG4gKiBUaGlzIG1vZHVsZSBpcyBpbnRlbmRlZCB0byBiZSBleGVjdXRlZCBib3RoIG9uIGNsaWVudCBzaWRlIGFuZCBzZXJ2ZXIgc2lkZS5cbiAqIE5vIGVycm9yIHNob3VsZCBiZSB0aHJvd24uIChzb2Z0IGVycm9yIGhhbmRsaW5nKVxuICovXG5cbihmdW5jdGlvbiAoKSB7XG5cdHZhciByb290ID0ge307XG5cdC8vIERlcGVuZGVuY2llcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRyb290LmFzeW5jID0gKHR5cGVvZiByZXF1aXJlID09PSAnZnVuY3Rpb24nKSA/IHJlcXVpcmUoJ2FzeW5jJykgOiB3aW5kb3cuYXN5bmM7XG5cdGlmICh0eXBlb2Ygcm9vdC5hc3luYyAhPT0gJ29iamVjdCcpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoJ01vZHVsZSBhc3luYyBpcyByZXF1aXJlZCAoaHR0cHM6Ly9naXRodWIuY29tL2Nhb2xhbi9hc3luYyknKTtcblx0fVxuXHR2YXIgYXN5bmMgPSByb290LmFzeW5jO1xuXG5cdGZ1bmN0aW9uIF9leHRlbmQob3JpZ2luLCBhZGQpIHtcblx0XHRpZiAoIWFkZCB8fCB0eXBlb2YgYWRkICE9PSAnb2JqZWN0Jykge1xuXHRcdFx0cmV0dXJuIG9yaWdpbjtcblx0XHR9XG5cdFx0dmFyIGtleXMgPSBPYmplY3Qua2V5cyhhZGQpO1xuXHRcdHZhciBpID0ga2V5cy5sZW5ndGg7XG5cdFx0d2hpbGUgKGktLSkge1xuXHRcdFx0b3JpZ2luW2tleXNbaV1dID0gYWRkW2tleXNbaV1dO1xuXHRcdH1cblx0XHRyZXR1cm4gb3JpZ2luO1xuXHR9XG5cblx0ZnVuY3Rpb24gX21lcmdlKCkge1xuXHRcdHZhciByZXQgPSB7fTtcblx0XHR2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG5cdFx0dmFyIGtleXMgPSBudWxsO1xuXHRcdHZhciBpID0gbnVsbDtcblxuXHRcdGFyZ3MuZm9yRWFjaChmdW5jdGlvbiAoYXJnKSB7XG5cdFx0XHRpZiAoYXJnICYmIGFyZy5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0KSB7XG5cdFx0XHRcdGtleXMgPSBPYmplY3Qua2V5cyhhcmcpO1xuXHRcdFx0XHRpID0ga2V5cy5sZW5ndGg7XG5cdFx0XHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdFx0XHRyZXRba2V5c1tpXV0gPSBhcmdba2V5c1tpXV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gcmV0O1xuXHR9XG5cblx0Ly8gQ3VzdG9taXNhYmxlIGNsYXNzIChCYXNlIGNsYXNzKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFVzZSB3aXRoIG9wZXJhdGlvbiBcIm5ld1wiIHRvIGV4dGVuZCBWYWxpZGF0aW9uIGFuZCBTYW5pdGl6YXRpb24gdGhlbXNlbHZlcyxcblx0Ly8gbm90IHRoZWlyIHByb3RvdHlwZS4gSW4gb3RoZXIgd29yZHMsIGNvbnN0cnVjdG9yIHNoYWxsIGJlIGNhbGwgdG8gZXh0ZW5kXG5cdC8vIHRob3NlIGZ1bmN0aW9ucywgaW5zdGVhZCBvZiBiZWluZyBpbiB0aGVpciBjb25zdHJ1Y3RvciwgbGlrZSB0aGlzOlxuXHQvL1x0XHRfZXh0ZW5kKFZhbGlkYXRpb24sIG5ldyBDdXN0b21pc2FibGUpO1xuXG5cdGZ1bmN0aW9uIEN1c3RvbWlzYWJsZSgpIHtcblx0XHR0aGlzLmN1c3RvbSA9IHt9O1xuXG5cdFx0dGhpcy5leHRlbmQgPSBmdW5jdGlvbiAoY3VzdG9tKSB7XG5cdFx0XHRyZXR1cm4gX2V4dGVuZCh0aGlzLmN1c3RvbSwgY3VzdG9tKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5yZXNldCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHRoaXMuY3VzdG9tID0ge307XG5cdFx0fTtcblxuXHRcdHRoaXMucmVtb3ZlID0gZnVuY3Rpb24gKGZpZWxkcykge1xuXHRcdFx0aWYgKCFfdHlwZUlzLmFycmF5KGZpZWxkcykpIHtcblx0XHRcdFx0ZmllbGRzID0gW2ZpZWxkc107XG5cdFx0XHR9XG5cdFx0XHRmaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoZmllbGQpIHtcblx0XHRcdFx0ZGVsZXRlIHRoaXMuY3VzdG9tW2ZpZWxkXTtcblx0XHRcdH0sIHRoaXMpO1xuXHRcdH07XG5cdH1cblxuXHQvLyBJbnNwZWN0aW9uIGNsYXNzIChCYXNlIGNsYXNzKSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gVXNlIHRvIGV4dGVuZCBWYWxpZGF0aW9uIGFuZCBTYW5pdGl6YXRpb24gcHJvdG90eXBlcy4gSW5zcGVjdGlvblxuXHQvLyBjb25zdHJ1Y3RvciBzaGFsbCBiZSBjYWxsZWQgaW4gZGVyaXZlZCBjbGFzcyBjb25zdHJ1Y3Rvci5cblxuXHRmdW5jdGlvbiBJbnNwZWN0aW9uKHNjaGVtYSwgY3VzdG9tKSB7XG5cdFx0dmFyIF9zdGFjayA9IFsnQCddO1xuXG5cdFx0dGhpcy5fc2NoZW1hID0gc2NoZW1hO1xuXHRcdHRoaXMuX2N1c3RvbSA9IHt9O1xuXHRcdGlmIChjdXN0b20gIT0gbnVsbCkge1xuXHRcdFx0Zm9yICh2YXIga2V5IGluIGN1c3RvbSkge1xuXHRcdFx0XHRpZiAoY3VzdG9tLmhhc093blByb3BlcnR5KGtleSkpe1xuXHRcdFx0XHRcdHRoaXMuX2N1c3RvbVsnJCcgKyBrZXldID0gY3VzdG9tW2tleV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLl9nZXREZXB0aCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBfc3RhY2subGVuZ3RoO1xuXHRcdH07XG5cblx0XHR0aGlzLl9kdW1wU3RhY2sgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gX3N0YWNrLm1hcChmdW5jdGlvbiAoaSkge3JldHVybiBpLnJlcGxhY2UoL15cXFsvZywgJ1xcMDMzXFwwMzRcXDAzNVxcMDM2Jyk7fSlcblx0XHRcdC5qb2luKCcuJykucmVwbGFjZSgvXFwuXFwwMzNcXDAzNFxcMDM1XFwwMzYvZywgJ1snKTtcblx0XHR9O1xuXG5cdFx0dGhpcy5fZGVlcGVyT2JqZWN0ID0gZnVuY3Rpb24gKG5hbWUpIHtcblx0XHRcdF9zdGFjay5wdXNoKCgvXlthLXokX11bYS16MC05JF9dKiQvaSkudGVzdChuYW1lKSA/IG5hbWUgOiAnW1wiJyArIG5hbWUgKyAnXCJdJyk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9O1xuXG5cdFx0dGhpcy5fZGVlcGVyQXJyYXkgPSBmdW5jdGlvbiAoaSkge1xuXHRcdFx0X3N0YWNrLnB1c2goJ1snICsgaSArICddJyk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9O1xuXG5cdFx0dGhpcy5fYmFjayA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdF9zdGFjay5wb3AoKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH07XG5cdH1cblx0Ly8gU2ltcGxlIHR5cGVzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIElmIHRoZSBwcm9wZXJ0eSBpcyBub3QgZGVmaW5lZCBvciBpcyBub3QgaW4gdGhpcyBsaXN0OlxuXHR2YXIgX3R5cGVJcyA9IHtcblx0XHRcImZ1bmN0aW9uXCI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gdHlwZW9mIGVsZW1lbnQgPT09ICdmdW5jdGlvbic7XG5cdFx0fSxcblx0XHRcInN0cmluZ1wiOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIHR5cGVvZiBlbGVtZW50ID09PSAnc3RyaW5nJztcblx0XHR9LFxuXHRcdFwibnVtYmVyXCI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gdHlwZW9mIGVsZW1lbnQgPT09ICdudW1iZXInICYmICFpc05hTihlbGVtZW50KTtcblx0XHR9LFxuXHRcdFwiaW50ZWdlclwiOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIHR5cGVvZiBlbGVtZW50ID09PSAnbnVtYmVyJyAmJiBlbGVtZW50ICUgMSA9PT0gMDtcblx0XHR9LFxuXHRcdFwiTmFOXCI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gdHlwZW9mIGVsZW1lbnQgPT09ICdudW1iZXInICYmIGlzTmFOKGVsZW1lbnQpO1xuXHRcdH0sXG5cdFx0XCJib29sZWFuXCI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gdHlwZW9mIGVsZW1lbnQgPT09ICdib29sZWFuJztcblx0XHR9LFxuXHRcdFwibnVsbFwiOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIGVsZW1lbnQgPT09IG51bGw7XG5cdFx0fSxcblx0XHRcImRhdGVcIjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiBlbGVtZW50ICE9IG51bGwgJiYgZWxlbWVudCBpbnN0YW5jZW9mIERhdGU7XG5cdFx0fSxcblx0XHRcIm9iamVjdFwiOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIGVsZW1lbnQgIT0gbnVsbCAmJiBlbGVtZW50LmNvbnN0cnVjdG9yID09PSBPYmplY3Q7XG5cdFx0fSxcblx0XHRcImFycmF5XCI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gZWxlbWVudCAhPSBudWxsICYmIGVsZW1lbnQuY29uc3RydWN0b3IgPT09IEFycmF5O1xuXHRcdH0sXG5cdFx0XCJhbnlcIjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0fTtcblxuXHRmdW5jdGlvbiBfc2ltcGxlVHlwZSh0eXBlLCBjYW5kaWRhdGUpIHtcblx0XHRpZiAodHlwZW9mIHR5cGUgPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0cmV0dXJuIGNhbmRpZGF0ZSBpbnN0YW5jZW9mIHR5cGU7XG5cdFx0fVxuXHRcdHR5cGUgPSB0eXBlIGluIF90eXBlSXMgPyB0eXBlIDogJ2FueSc7XG5cdFx0cmV0dXJuIF90eXBlSXNbdHlwZV0oY2FuZGlkYXRlKTtcblx0fVxuXG5cdGZ1bmN0aW9uIF9yZWFsVHlwZShjYW5kaWRhdGUpIHtcblx0XHRmb3IgKHZhciBpIGluIF90eXBlSXMpIHtcblx0XHRcdGlmIChfc2ltcGxlVHlwZShpLCBjYW5kaWRhdGUpKSB7XG5cdFx0XHRcdGlmIChpICE9PSAnYW55JykgeyByZXR1cm4gaTsgfVxuXHRcdFx0XHRyZXR1cm4gJ2FuIGluc3RhbmNlIG9mICcgKyBjYW5kaWRhdGUuY29uc3RydWN0b3IubmFtZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRJbmRleGVzKGEsIHZhbHVlKSB7XG5cdFx0dmFyIGluZGV4ZXMgPSBbXTtcblx0XHR2YXIgaSA9IGEuaW5kZXhPZih2YWx1ZSk7XG5cblx0XHR3aGlsZSAoaSAhPT0gLTEpIHtcblx0XHRcdGluZGV4ZXMucHVzaChpKTtcblx0XHRcdGkgPSBhLmluZGV4T2YodmFsdWUsIGkgKyAxKTtcblx0XHR9XG5cdFx0cmV0dXJuIGluZGV4ZXM7XG5cdH1cblxuXHQvLyBBdmFpbGFibGUgZm9ybWF0cyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0dmFyIF9mb3JtYXRzID0ge1xuXHRcdCd2b2lkJzogL14kLyxcblx0XHQndXJsJzogL14oaHR0cHM/fGZ0cCk6XFwvXFwvKCgoKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDopKkApPygoKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKSl8KCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLik/KChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuPykoOlxcZCopPykoXFwvKCgoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKSsoXFwvKChbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApKikqKT8pPyhcXD8oKChbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApfFtcXHVFMDAwLVxcdUY4RkZdfFxcL3xcXD8pKik/KFxcIygoKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCl8XFwvfFxcPykqKT8kL2ksXG5cdFx0J2RhdGUtdGltZSc6IC9eXFxkezR9LVxcZHsyfS1cXGR7Mn1UXFxkezJ9OlxcZHsyfTpcXGR7Mn0oXFwuXFxkezN9KT8oWj98KC18XFwrKVxcZHsyfTpcXGR7Mn0pJC8sXG5cdFx0J2RhdGUnOiAvXlxcZHs0fS1cXGR7Mn0tXFxkezJ9JC8sXG5cdFx0J2Nvb2xEYXRlVGltZSc6IC9eXFxkezR9KC18XFwvKVxcZHsyfSgtfFxcLylcXGR7Mn0oVHwgKVxcZHsyfTpcXGR7Mn06XFxkezJ9KFxcLlxcZHszfSk/Wj8kLyxcblx0XHQndGltZSc6IC9eXFxkezJ9XFw6XFxkezJ9XFw6XFxkezJ9JC8sXG5cdFx0J2NvbG9yJzogL14jKFswLTlhLWZdKSskL2ksXG5cdFx0J2VtYWlsJzogL14oKChbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKFxcLihbYS16XXxcXGR8WyEjXFwkJSYnXFwqXFwrXFwtXFwvPVxcP1xcXl9ge1xcfH1+XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkrKSopfCgoXFx4MjIpKCgoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oKFtcXHgwMS1cXHgwOFxceDBiXFx4MGNcXHgwZS1cXHgxZlxceDdmXXxcXHgyMXxbXFx4MjMtXFx4NWJdfFtcXHg1ZC1cXHg3ZV18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfChcXFxcKFtcXHgwMS1cXHgwOVxceDBiXFx4MGNcXHgwZC1cXHg3Zl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSkpKigoKFxceDIwfFxceDA5KSooXFx4MGRcXHgwYSkpPyhcXHgyMHxcXHgwOSkrKT8oXFx4MjIpKSlAKCgoW2Etel18XFxkfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLikrKChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkqKFthLXpdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpXFwuPyQvaSxcblx0XHQnbnVtZXJpYyc6IC9eWzAtOV0rJC8sXG5cdFx0J2ludGVnZXInOiAvXlxcLT9bMC05XSskLyxcblx0XHQnZGVjaW1hbCc6IC9eXFwtP1swLTldKlxcLj9bMC05XSskLyxcblx0XHQnYWxwaGEnOiAvXlthLXpdKyQvaSxcblx0XHQnYWxwaGFOdW1lcmljJzogL15bYS16MC05XSskL2ksXG5cdFx0J2FscGhhRGFzaCc6IC9eW2EtejAtOV8tXSskL2ksXG5cdFx0J2phdmFzY3JpcHQnOiAvXlthLXpfXFwkXVthLXowLTlfXFwkXSokL2ksXG5cdFx0J3VwcGVyU3RyaW5nJzogL15bQS1aIF0qJC8sXG5cdFx0J2xvd2VyU3RyaW5nJzogL15bYS16IF0qJC9cblx0fTtcblxuLy8gVmFsaWRhdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0dmFyIF92YWxpZGF0aW9uQXR0cmlidXQgPSB7XG5cdFx0b3B0aW9uYWw6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0dmFyIG9wdCA9IHR5cGVvZiBzY2hlbWEub3B0aW9uYWwgPT09ICdib29sZWFuJyA/IHNjaGVtYS5vcHRpb25hbCA6IChzY2hlbWEub3B0aW9uYWwgPT09ICd0cnVlJyk7IC8vIERlZmF1bHQgaXMgZmFsc2VcblxuXHRcdFx0aWYgKG9wdCA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIGNhbmRpZGF0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoJ2lzIG1pc3NpbmcgYW5kIG5vdCBvcHRpb25hbCcpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0dHlwZTogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHQvLyByZXR1cm4gYmVjYXVzZSBvcHRpb25hbCBmdW5jdGlvbiBhbHJlYWR5IGhhbmRsZSB0aGlzIGNhc2Vcblx0XHRcdGlmICh0eXBlb2YgY2FuZGlkYXRlID09PSAndW5kZWZpbmVkJyB8fCAodHlwZW9mIHNjaGVtYS50eXBlICE9PSAnc3RyaW5nJyAmJiAhKHNjaGVtYS50eXBlIGluc3RhbmNlb2YgQXJyYXkpICYmIHR5cGVvZiBzY2hlbWEudHlwZSAhPT0gJ2Z1bmN0aW9uJykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHR5cGVzID0gX3R5cGVJcy5hcnJheShzY2hlbWEudHlwZSkgPyBzY2hlbWEudHlwZSA6IFtzY2hlbWEudHlwZV07XG5cdFx0XHR2YXIgdHlwZUlzVmFsaWQgPSB0eXBlcy5zb21lKGZ1bmN0aW9uICh0eXBlKSB7XG5cdFx0XHRcdHJldHVybiBfc2ltcGxlVHlwZSh0eXBlLCBjYW5kaWRhdGUpO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoIXR5cGVJc1ZhbGlkKSB7XG5cdFx0XHRcdHR5cGVzID0gdHlwZXMubWFwKGZ1bmN0aW9uICh0KSB7cmV0dXJuIHR5cGVvZiB0ID09PSAnZnVuY3Rpb24nID8gJ2FuZCBpbnN0YW5jZSBvZiAnICsgdC5uYW1lIDogdDsgfSk7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IGJlICcgKyB0eXBlcy5qb2luKCcgb3IgJykgKyAnLCBidXQgaXMgJyArIF9yZWFsVHlwZShjYW5kaWRhdGUpKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHVuaXF1ZW5lc3M6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEudW5pcXVlbmVzcyA9PT0gJ3N0cmluZycpIHsgc2NoZW1hLnVuaXF1ZW5lc3MgPSAoc2NoZW1hLnVuaXF1ZW5lc3MgPT09ICd0cnVlJyk7IH1cblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hLnVuaXF1ZW5lc3MgIT09ICdib29sZWFuJyB8fCBzY2hlbWEudW5pcXVlbmVzcyA9PT0gZmFsc2UgfHwgKCFfdHlwZUlzLmFycmF5KGNhbmRpZGF0ZSkgJiYgdHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ3N0cmluZycpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciByZXBvcnRlZCA9IFtdO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBjYW5kaWRhdGUubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHJlcG9ydGVkLmluZGV4T2YoY2FuZGlkYXRlW2ldKSA+PSAwKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFyIGluZGV4ZXMgPSBnZXRJbmRleGVzKGNhbmRpZGF0ZSwgY2FuZGlkYXRlW2ldKTtcblx0XHRcdFx0aWYgKGluZGV4ZXMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdHJlcG9ydGVkLnB1c2goY2FuZGlkYXRlW2ldKTtcblx0XHRcdFx0XHR0aGlzLnJlcG9ydCgnaGFzIHZhbHVlIFsnICsgY2FuZGlkYXRlW2ldICsgJ10gbW9yZSB0aGFuIG9uY2UgYXQgaW5kZXhlcyBbJyArIGluZGV4ZXMuam9pbignLCAnKSArICddJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdHBhdHRlcm46IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0dmFyIHJlZ2V4cyA9IHNjaGVtYS5wYXR0ZXJuO1xuXHRcdFx0aWYgKHR5cGVvZiBjYW5kaWRhdGUgIT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBtYXRjaGVzID0gZmFsc2U7XG5cdFx0XHRpZiAoIV90eXBlSXMuYXJyYXkocmVnZXhzKSkge1xuXHRcdFx0XHRyZWdleHMgPSBbcmVnZXhzXTtcblx0XHRcdH1cblx0XHRcdHJlZ2V4cy5mb3JFYWNoKGZ1bmN0aW9uIChyZWdleCkge1xuXHRcdFx0XHRpZiAodHlwZW9mIHJlZ2V4ID09PSAnc3RyaW5nJyAmJiByZWdleCBpbiBfZm9ybWF0cykge1xuXHRcdFx0XHRcdHJlZ2V4ID0gX2Zvcm1hdHNbcmVnZXhdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChyZWdleCBpbnN0YW5jZW9mIFJlZ0V4cCkge1xuXHRcdFx0XHRcdGlmIChyZWdleC50ZXN0KGNhbmRpZGF0ZSkpIHtcblx0XHRcdFx0XHRcdG1hdGNoZXMgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRpZiAoIW1hdGNoZXMpIHtcblx0XHRcdFx0c2VsZi5yZXBvcnQoJ211c3QgbWF0Y2ggWycgKyByZWdleHMuam9pbignIG9yICcpICsgJ10sIGJ1dCBpcyBlcXVhbCB0byBcIicgKyBjYW5kaWRhdGUgKyAnXCInKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHZhbGlkRGF0ZTogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHRpZiAoU3RyaW5nKHNjaGVtYS52YWxpZERhdGUpID09PSAndHJ1ZScgJiYgY2FuZGlkYXRlIGluc3RhbmNlb2YgRGF0ZSAmJiBpc05hTihjYW5kaWRhdGUuZ2V0VGltZSgpKSkge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBiZSBhIHZhbGlkIGRhdGUnKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdG1pbkxlbmd0aDogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ3N0cmluZycgJiYgIV90eXBlSXMuYXJyYXkoY2FuZGlkYXRlKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgbWluTGVuZ3RoID0gTnVtYmVyKHNjaGVtYS5taW5MZW5ndGgpO1xuXHRcdFx0aWYgKGlzTmFOKG1pbkxlbmd0aCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNhbmRpZGF0ZS5sZW5ndGggPCBtaW5MZW5ndGgpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3QgYmUgbG9uZ2VyIHRoYW4gJyArIG1pbkxlbmd0aCArICcgZWxlbWVudHMsIGJ1dCBpdCBoYXMgJyArIGNhbmRpZGF0ZS5sZW5ndGgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0bWF4TGVuZ3RoOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdGlmICh0eXBlb2YgY2FuZGlkYXRlICE9PSAnc3RyaW5nJyAmJiAhX3R5cGVJcy5hcnJheShjYW5kaWRhdGUpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBtYXhMZW5ndGggPSBOdW1iZXIoc2NoZW1hLm1heExlbmd0aCk7XG5cdFx0XHRpZiAoaXNOYU4obWF4TGVuZ3RoKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoY2FuZGlkYXRlLmxlbmd0aCA+IG1heExlbmd0aCkge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBiZSBzaG9ydGVyIHRoYW4gJyArIG1heExlbmd0aCArICcgZWxlbWVudHMsIGJ1dCBpdCBoYXMgJyArIGNhbmRpZGF0ZS5sZW5ndGgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0ZXhhY3RMZW5ndGg6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0aWYgKHR5cGVvZiBjYW5kaWRhdGUgIT09ICdzdHJpbmcnICYmICFfdHlwZUlzLmFycmF5KGNhbmRpZGF0ZSkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGV4YWN0TGVuZ3RoID0gTnVtYmVyKHNjaGVtYS5leGFjdExlbmd0aCk7XG5cdFx0XHRpZiAoaXNOYU4oZXhhY3RMZW5ndGgpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmIChjYW5kaWRhdGUubGVuZ3RoICE9PSBleGFjdExlbmd0aCkge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBoYXZlIGV4YWN0bHkgJyArIGV4YWN0TGVuZ3RoICsgJyBlbGVtZW50cywgYnV0IGl0IGhhdmUgJyArIGNhbmRpZGF0ZS5sZW5ndGgpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0bHQ6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0dmFyIGxpbWl0ID0gTnVtYmVyKHNjaGVtYS5sdCk7XG5cdFx0XHRpZiAodHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ251bWJlcicgfHwgaXNOYU4obGltaXQpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmIChjYW5kaWRhdGUgPj0gbGltaXQpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3QgYmUgbGVzcyB0aGFuICcgKyBsaW1pdCArICcsIGJ1dCBpcyBlcXVhbCB0byBcIicgKyBjYW5kaWRhdGUgKyAnXCInKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGx0ZTogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHR2YXIgbGltaXQgPSBOdW1iZXIoc2NoZW1hLmx0ZSk7XG5cdFx0XHRpZiAodHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ251bWJlcicgfHwgaXNOYU4obGltaXQpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmIChjYW5kaWRhdGUgPiBsaW1pdCkge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBiZSBsZXNzIHRoYW4gb3IgZXF1YWwgdG8gJyArIGxpbWl0ICsgJywgYnV0IGlzIGVxdWFsIHRvIFwiJyArIGNhbmRpZGF0ZSArICdcIicpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Z3Q6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0dmFyIGxpbWl0ID0gTnVtYmVyKHNjaGVtYS5ndCk7XG5cdFx0XHRpZiAodHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ251bWJlcicgfHwgaXNOYU4obGltaXQpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmIChjYW5kaWRhdGUgPD0gbGltaXQpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3QgYmUgZ3JlYXRlciB0aGFuICcgKyBsaW1pdCArICcsIGJ1dCBpcyBlcXVhbCB0byBcIicgKyBjYW5kaWRhdGUgKyAnXCInKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGd0ZTogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHR2YXIgbGltaXQgPSBOdW1iZXIoc2NoZW1hLmd0ZSk7XG5cdFx0XHRpZiAodHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ251bWJlcicgfHwgaXNOYU4obGltaXQpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmIChjYW5kaWRhdGUgPCBsaW1pdCkge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBiZSBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gJyArIGxpbWl0ICsgJywgYnV0IGlzIGVxdWFsIHRvIFwiJyArIGNhbmRpZGF0ZSArICdcIicpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0ZXE6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0aWYgKHR5cGVvZiBjYW5kaWRhdGUgIT09ICdudW1iZXInICYmIHR5cGVvZiBjYW5kaWRhdGUgIT09ICdzdHJpbmcnICYmIHR5cGVvZiBjYW5kaWRhdGUgIT09ICdib29sZWFuJykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgbGltaXQgPSBzY2hlbWEuZXE7XG5cdFx0XHRpZiAodHlwZW9mIGxpbWl0ICE9PSAnbnVtYmVyJyAmJiB0eXBlb2YgbGltaXQgIT09ICdzdHJpbmcnICYmIHR5cGVvZiBsaW1pdCAhPT0gJ2Jvb2xlYW4nICYmICFfdHlwZUlzLmFycmF5KGxpbWl0KSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoX3R5cGVJcy5hcnJheShsaW1pdCkpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaW1pdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGlmIChjYW5kaWRhdGUgPT09IGxpbWl0W2ldKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IGJlIGVxdWFsIHRvIFsnICsgbGltaXQubWFwKGZ1bmN0aW9uIChsKSB7XG5cdFx0XHRcdFx0cmV0dXJuICdcIicgKyBsICsgJ1wiJztcblx0XHRcdFx0fSkuam9pbignIG9yICcpICsgJ10sIGJ1dCBpcyBlcXVhbCB0byBcIicgKyBjYW5kaWRhdGUgKyAnXCInKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZiAoY2FuZGlkYXRlICE9PSBsaW1pdCkge1xuXHRcdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IGJlIGVxdWFsIHRvIFwiJyArIGxpbWl0ICsgJ1wiLCBidXQgaXMgZXF1YWwgdG8gXCInICsgY2FuZGlkYXRlICsgJ1wiJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdG5lOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdGlmICh0eXBlb2YgY2FuZGlkYXRlICE9PSAnbnVtYmVyJyAmJiB0eXBlb2YgY2FuZGlkYXRlICE9PSAnc3RyaW5nJykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgbGltaXQgPSBzY2hlbWEubmU7XG5cdFx0XHRpZiAodHlwZW9mIGxpbWl0ICE9PSAnbnVtYmVyJyAmJiB0eXBlb2YgbGltaXQgIT09ICdzdHJpbmcnICYmICFfdHlwZUlzLmFycmF5KGxpbWl0KSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoX3R5cGVJcy5hcnJheShsaW1pdCkpIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsaW1pdC5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGlmIChjYW5kaWRhdGUgPT09IGxpbWl0W2ldKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBub3QgYmUgZXF1YWwgdG8gXCInICsgbGltaXRbaV0gKyAnXCInKTtcblx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRpZiAoY2FuZGlkYXRlID09PSBsaW1pdCkge1xuXHRcdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IG5vdCBiZSBlcXVhbCB0byBcIicgKyBsaW1pdCArICdcIicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRzb21lS2V5czogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXQpIHtcblx0XHRcdHZhciBfa2V5cyA9IHNjaGVtYS5zb21lS2V5cztcblx0XHRcdGlmICghX3R5cGVJcy5vYmplY3QoY2FuZGlkYXQpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciB2YWxpZCA9IF9rZXlzLnNvbWUoZnVuY3Rpb24gKGFjdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gKGFjdGlvbiBpbiBjYW5kaWRhdCk7XG5cdFx0XHR9KTtcblx0XHRcdGlmICghdmFsaWQpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3QgaGF2ZSBhdCBsZWFzdCBrZXkgJyArIF9rZXlzLm1hcChmdW5jdGlvbiAoaSkge1xuXHRcdFx0XHRcdHJldHVybiAnXCInICsgaSArICdcIic7XG5cdFx0XHRcdH0pLmpvaW4oJyBvciAnKSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRzdHJpY3Q6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEuc3RyaWN0ID09PSAnc3RyaW5nJykgeyBzY2hlbWEuc3RyaWN0ID0gKHNjaGVtYS5zdHJpY3QgPT09ICd0cnVlJyk7IH1cblx0XHRcdGlmIChzY2hlbWEuc3RyaWN0ICE9PSB0cnVlIHx8ICFfdHlwZUlzLm9iamVjdChjYW5kaWRhdGUpIHx8ICFfdHlwZUlzLm9iamVjdChzY2hlbWEucHJvcGVydGllcykpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEucHJvcGVydGllc1snKiddID09PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHR2YXIgaW50cnVkZXIgPSBPYmplY3Qua2V5cyhjYW5kaWRhdGUpLmZpbHRlcihmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0cmV0dXJuICh0eXBlb2Ygc2NoZW1hLnByb3BlcnRpZXNba2V5XSA9PT0gJ3VuZGVmaW5lZCcpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKGludHJ1ZGVyLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHR2YXIgbXNnID0gJ3Nob3VsZCBub3QgY29udGFpbnMgJyArIChpbnRydWRlci5sZW5ndGggPiAxID8gJ3Byb3BlcnRpZXMnIDogJ3Byb3BlcnR5JykgK1xuXHRcdFx0XHRcdFx0JyBbJyArIGludHJ1ZGVyLm1hcChmdW5jdGlvbiAoaSkgeyByZXR1cm4gJ1wiJyArIGkgKyAnXCInOyB9KS5qb2luKCcsICcpICsgJ10nO1xuXHRcdFx0XHRcdHNlbGYucmVwb3J0KG1zZyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXHRcdGV4ZWM6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSwgY2FsbGJhY2spIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblxuXHRcdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5hc3luY0V4ZWMoc2NoZW1hLCBjYW5kaWRhdGUsIGNhbGxiYWNrKTtcblx0XHRcdH1cblx0XHRcdChfdHlwZUlzLmFycmF5KHNjaGVtYS5leGVjKSA/IHNjaGVtYS5leGVjIDogW3NjaGVtYS5leGVjXSkuZm9yRWFjaChmdW5jdGlvbiAoZXhlYykge1xuXHRcdFx0XHRpZiAodHlwZW9mIGV4ZWMgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRleGVjLmNhbGwoc2VsZiwgc2NoZW1hLCBjYW5kaWRhdGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdHByb3BlcnRpZXM6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSwgY2FsbGJhY2spIHtcblx0XHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuYXN5bmNQcm9wZXJ0aWVzKHNjaGVtYSwgY2FuZGlkYXRlLCBjYWxsYmFjayk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIShzY2hlbWEucHJvcGVydGllcyBpbnN0YW5jZW9mIE9iamVjdCkgfHwgIShjYW5kaWRhdGUgaW5zdGFuY2VvZiBPYmplY3QpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBwcm9wZXJ0aWVzID0gc2NoZW1hLnByb3BlcnRpZXMsXG5cdFx0XHRcdFx0aTtcblx0XHRcdGlmIChwcm9wZXJ0aWVzWycqJ10gIT0gbnVsbCkge1xuXHRcdFx0XHRmb3IgKGkgaW4gY2FuZGlkYXRlKSB7XG5cdFx0XHRcdFx0aWYgKGkgaW4gcHJvcGVydGllcykge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuX2RlZXBlck9iamVjdChpKTtcblx0XHRcdFx0XHR0aGlzLl92YWxpZGF0ZShwcm9wZXJ0aWVzWycqJ10sIGNhbmRpZGF0ZVtpXSk7XG5cdFx0XHRcdFx0dGhpcy5fYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRmb3IgKGkgaW4gcHJvcGVydGllcykge1xuXHRcdFx0XHRpZiAoaSA9PT0gJyonKSB7XG5cdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5fZGVlcGVyT2JqZWN0KGkpO1xuXHRcdFx0XHR0aGlzLl92YWxpZGF0ZShwcm9wZXJ0aWVzW2ldLCBjYW5kaWRhdGVbaV0pO1xuXHRcdFx0XHR0aGlzLl9iYWNrKCk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRpdGVtczogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlLCBjYWxsYmFjaykge1xuXHRcdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5hc3luY0l0ZW1zKHNjaGVtYSwgY2FuZGlkYXRlLCBjYWxsYmFjayk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIShzY2hlbWEuaXRlbXMgaW5zdGFuY2VvZiBPYmplY3QpIHx8ICEoY2FuZGlkYXRlIGluc3RhbmNlb2YgT2JqZWN0KSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgaXRlbXMgPSBzY2hlbWEuaXRlbXM7XG5cdFx0XHR2YXIgaSwgbDtcblx0XHRcdC8vIElmIHByb3ZpZGVkIHNjaGVtYSBpcyBhbiBhcnJheVxuXHRcdFx0Ly8gdGhlbiBjYWxsIHZhbGlkYXRlIGZvciBlYWNoIGNhc2Vcblx0XHRcdC8vIGVsc2UgaXQgaXMgYW4gT2JqZWN0XG5cdFx0XHQvLyB0aGVuIGNhbGwgdmFsaWRhdGUgZm9yIGVhY2gga2V5XG5cdFx0XHRpZiAoX3R5cGVJcy5hcnJheShpdGVtcykgJiYgX3R5cGVJcy5hcnJheShjYW5kaWRhdGUpKSB7XG5cdFx0XHRcdGZvciAoaSA9IDAsIGwgPSBpdGVtcy5sZW5ndGg7IGkgPCBsOyBpKyspIHtcblx0XHRcdFx0XHR0aGlzLl9kZWVwZXJBcnJheShpKTtcblx0XHRcdFx0XHR0aGlzLl92YWxpZGF0ZShpdGVtc1tpXSwgY2FuZGlkYXRlW2ldKTtcblx0XHRcdFx0XHR0aGlzLl9iYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRmb3IgKHZhciBrZXkgaW4gY2FuZGlkYXRlKSB7XG5cdFx0XHRcdFx0aWYgKGNhbmRpZGF0ZS5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcblx0XHRcdFx0XHRcdHRoaXMuX2RlZXBlckFycmF5KGtleSk7XG5cdFx0XHRcdFx0XHR0aGlzLl92YWxpZGF0ZShpdGVtcywgY2FuZGlkYXRlW2tleV0pO1xuXHRcdFx0XHRcdFx0dGhpcy5fYmFjaygpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBfYXN5bmNWYWxpZGF0aW9uQXR0cmlidXQgPSB7XG5cdFx0YXN5bmNFeGVjOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRhc3luYy5lYWNoU2VyaWVzKF90eXBlSXMuYXJyYXkoc2NoZW1hLmV4ZWMpID8gc2NoZW1hLmV4ZWMgOiBbc2NoZW1hLmV4ZWNdLCBmdW5jdGlvbiAoZXhlYywgZG9uZSkge1xuXHRcdFx0XHRpZiAodHlwZW9mIGV4ZWMgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRpZiAoZXhlYy5sZW5ndGggPiAyKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gZXhlYy5jYWxsKHNlbGYsIHNjaGVtYSwgY2FuZGlkYXRlLCBkb25lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0ZXhlYy5jYWxsKHNlbGYsIHNjaGVtYSwgY2FuZGlkYXRlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhc3luYy5uZXh0VGljayhkb25lKTtcblx0XHRcdH0sIGNhbGxiYWNrKTtcblx0XHR9LFxuXHRcdGFzeW5jUHJvcGVydGllczogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlLCBjYWxsYmFjaykge1xuXHRcdFx0aWYgKCEoc2NoZW1hLnByb3BlcnRpZXMgaW5zdGFuY2VvZiBPYmplY3QpIHx8ICFfdHlwZUlzLm9iamVjdChjYW5kaWRhdGUpKSB7XG5cdFx0XHRcdHJldHVybiBjYWxsYmFjaygpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0dmFyIHByb3BlcnRpZXMgPSBzY2hlbWEucHJvcGVydGllcztcblx0XHRcdGFzeW5jLnNlcmllcyhbXG5cdFx0XHRcdGZ1bmN0aW9uIChuZXh0KSB7XG5cdFx0XHRcdFx0aWYgKHByb3BlcnRpZXNbJyonXSA9PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbmV4dCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRhc3luYy5lYWNoU2VyaWVzKE9iamVjdC5rZXlzKGNhbmRpZGF0ZSksIGZ1bmN0aW9uIChpLCBkb25lKSB7XG5cdFx0XHRcdFx0XHRpZiAoaSBpbiBwcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBhc3luYy5uZXh0VGljayhkb25lKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNlbGYuX2RlZXBlck9iamVjdChpKTtcblx0XHRcdFx0XHRcdHNlbGYuX2FzeW5jVmFsaWRhdGUocHJvcGVydGllc1snKiddLCBjYW5kaWRhdGVbaV0sIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0c2VsZi5fYmFjaygpO1xuXHRcdFx0XHRcdFx0XHRkb25lKGVycik7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9LCBuZXh0KTtcblx0XHRcdFx0fSxcblx0XHRcdFx0ZnVuY3Rpb24gKG5leHQpIHtcblx0XHRcdFx0XHRhc3luYy5lYWNoU2VyaWVzKE9iamVjdC5rZXlzKHByb3BlcnRpZXMpLCBmdW5jdGlvbiAoaSwgZG9uZSkge1xuXHRcdFx0XHRcdFx0aWYgKGkgPT09ICcqJykge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYXN5bmMubmV4dFRpY2soZG9uZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzZWxmLl9kZWVwZXJPYmplY3QoaSk7XG5cdFx0XHRcdFx0XHRzZWxmLl9hc3luY1ZhbGlkYXRlKHByb3BlcnRpZXNbaV0sIGNhbmRpZGF0ZVtpXSwgZnVuY3Rpb24gKGVycikge1xuXHRcdFx0XHRcdFx0XHRzZWxmLl9iYWNrKCk7XG5cdFx0XHRcdFx0XHRcdGRvbmUoZXJyKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0sIG5leHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRdLCBjYWxsYmFjayk7XG5cdFx0fSxcblx0XHRhc3luY0l0ZW1zOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZiAoIShzY2hlbWEuaXRlbXMgaW5zdGFuY2VvZiBPYmplY3QpIHx8ICEoY2FuZGlkYXRlIGluc3RhbmNlb2YgT2JqZWN0KSkge1xuXHRcdFx0XHRyZXR1cm4gY2FsbGJhY2soKTtcblx0XHRcdH1cblx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdHZhciBpdGVtcyA9IHNjaGVtYS5pdGVtcztcblx0XHRcdHZhciBpLCBsO1xuXG5cdFx0XHRpZiAoX3R5cGVJcy5hcnJheShpdGVtcykgJiYgX3R5cGVJcy5hcnJheShjYW5kaWRhdGUpKSB7XG5cdFx0XHRcdGFzeW5jLnRpbWVzU2VyaWVzKGl0ZW1zLmxlbmd0aCwgZnVuY3Rpb24gKGksIGRvbmUpIHtcblx0XHRcdFx0XHRzZWxmLl9kZWVwZXJBcnJheShpKTtcblx0XHRcdFx0XHRzZWxmLl9hc3luY1ZhbGlkYXRlKGl0ZW1zW2ldLCBjYW5kaWRhdGVbaV0sIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuXHRcdFx0XHRcdFx0c2VsZi5fYmFjaygpO1xuXHRcdFx0XHRcdFx0ZG9uZShlcnIsIHJlcyk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0c2VsZi5fYmFjaygpO1xuXHRcdFx0XHR9LCBjYWxsYmFjayk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0YXN5bmMuZWFjaFNlcmllcyhPYmplY3Qua2V5cyhjYW5kaWRhdGUpLCBmdW5jdGlvbiAoa2V5LCBkb25lKSB7XG5cdFx0XHRcdFx0c2VsZi5fZGVlcGVyQXJyYXkoa2V5KTtcblx0XHRcdFx0XHRzZWxmLl9hc3luY1ZhbGlkYXRlKGl0ZW1zLCBjYW5kaWRhdGVba2V5XSwgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG5cdFx0XHRcdFx0XHRzZWxmLl9iYWNrKCk7XG5cdFx0XHRcdFx0XHRkb25lKGVyciwgcmVzKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSwgY2FsbGJhY2spO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHQvLyBWYWxpZGF0aW9uIENsYXNzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gaW5oZXJpdHMgZnJvbSBJbnNwZWN0aW9uIGNsYXNzIChhY3R1YWxseSB3ZSBqdXN0IGNhbGwgSW5zcGVjdGlvblxuXHQvLyBjb25zdHJ1Y3RvciB3aXRoIHRoZSBuZXcgY29udGV4dCwgYmVjYXVzZSBpdHMgcHJvdG90eXBlIGlzIGVtcHR5XG5cdGZ1bmN0aW9uIFZhbGlkYXRpb24oc2NoZW1hLCBjdXN0b20pIHtcblx0XHRJbnNwZWN0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIHNjaGVtYSwgX21lcmdlKFZhbGlkYXRpb24uY3VzdG9tLCBjdXN0b20pKTtcblx0XHR2YXIgX2Vycm9yID0gW107XG5cblx0XHR0aGlzLl9iYXNpY0ZpZWxkcyA9IE9iamVjdC5rZXlzKF92YWxpZGF0aW9uQXR0cmlidXQpO1xuXHRcdHRoaXMuX2N1c3RvbUZpZWxkcyA9IE9iamVjdC5rZXlzKHRoaXMuX2N1c3RvbSk7XG5cdFx0dGhpcy5vcmlnaW4gPSBudWxsO1xuXG5cdFx0dGhpcy5yZXBvcnQgPSBmdW5jdGlvbiAobWVzc2FnZSwgY29kZSkge1xuXHRcdFx0dmFyIG5ld0VyciA9IHtcblx0XHRcdFx0Y29kZTogY29kZSB8fCB0aGlzLnVzZXJDb2RlIHx8IG51bGwsXG5cdFx0XHRcdG1lc3NhZ2U6IHRoaXMudXNlckVycm9yIHx8IG1lc3NhZ2UgfHwgJ2lzIGludmFsaWQnLFxuXHRcdFx0XHRwcm9wZXJ0eTogdGhpcy51c2VyQWxpYXMgPyAodGhpcy51c2VyQWxpYXMgKyAnICgnICsgdGhpcy5fZHVtcFN0YWNrKCkgKyAnKScpIDogdGhpcy5fZHVtcFN0YWNrKClcblx0XHRcdH07XG5cdFx0XHRfZXJyb3IucHVzaChuZXdFcnIpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fTtcblxuXHRcdHRoaXMucmVzdWx0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZXJyb3I6IF9lcnJvcixcblx0XHRcdFx0dmFsaWQ6IF9lcnJvci5sZW5ndGggPT09IDAsXG5cdFx0XHRcdGZvcm1hdDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGlmICh0aGlzLnZhbGlkID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gJ0NhbmRpZGF0ZSBpcyB2YWxpZCc7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB0aGlzLmVycm9yLm1hcChmdW5jdGlvbiAoaSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICdQcm9wZXJ0eSAnICsgaS5wcm9wZXJ0eSArICc6ICcgKyBpLm1lc3NhZ2U7XG5cdFx0XHRcdFx0fSkuam9pbignXFxuJyk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fTtcblx0fVxuXG5cdF9leHRlbmQoVmFsaWRhdGlvbi5wcm90b3R5cGUsIF92YWxpZGF0aW9uQXR0cmlidXQpO1xuXHRfZXh0ZW5kKFZhbGlkYXRpb24ucHJvdG90eXBlLCBfYXN5bmNWYWxpZGF0aW9uQXR0cmlidXQpO1xuXHRfZXh0ZW5kKFZhbGlkYXRpb24sIG5ldyBDdXN0b21pc2FibGUoKSk7XG5cblx0VmFsaWRhdGlvbi5wcm90b3R5cGUudmFsaWRhdGUgPSBmdW5jdGlvbiAoY2FuZGlkYXRlLCBjYWxsYmFjaykge1xuXHRcdHRoaXMub3JpZ2luID0gY2FuZGlkYXRlO1xuXHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdHJldHVybiBhc3luYy5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHNlbGYuX2FzeW5jVmFsaWRhdGUoc2VsZi5fc2NoZW1hLCBjYW5kaWRhdGUsIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0XHRzZWxmLm9yaWdpbiA9IG51bGw7XG5cdFx0XHRcdFx0Y2FsbGJhY2soZXJyLCBzZWxmLnJlc3VsdCgpKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuX3ZhbGlkYXRlKHRoaXMuX3NjaGVtYSwgY2FuZGlkYXRlKS5yZXN1bHQoKTtcblx0fTtcblxuXHRWYWxpZGF0aW9uLnByb3RvdHlwZS5fdmFsaWRhdGUgPSBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUsIGNhbGxiYWNrKSB7XG5cdFx0dGhpcy51c2VyQ29kZSA9IHNjaGVtYS5jb2RlIHx8IG51bGw7XG5cdFx0dGhpcy51c2VyRXJyb3IgPSBzY2hlbWEuZXJyb3IgfHwgbnVsbDtcblx0XHR0aGlzLnVzZXJBbGlhcyA9IHNjaGVtYS5hbGlhcyB8fCBudWxsO1xuXHRcdHRoaXMuX2Jhc2ljRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGkpIHtcblx0XHRcdGlmICgoaSBpbiBzY2hlbWEgfHwgaSA9PT0gJ29wdGlvbmFsJykgJiYgdHlwZW9mIHRoaXNbaV0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0dGhpc1tpXShzY2hlbWEsIGNhbmRpZGF0ZSk7XG5cdFx0XHR9XG5cdFx0fSwgdGhpcyk7XG5cdFx0dGhpcy5fY3VzdG9tRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGkpIHtcblx0XHRcdGlmIChpIGluIHNjaGVtYSAmJiB0eXBlb2YgdGhpcy5fY3VzdG9tW2ldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHRoaXMuX2N1c3RvbVtpXS5jYWxsKHRoaXMsIHNjaGVtYSwgY2FuZGlkYXRlKTtcblx0XHRcdH1cblx0XHR9LCB0aGlzKTtcblx0XHRyZXR1cm4gdGhpcztcblx0fTtcblxuXHRWYWxpZGF0aW9uLnByb3RvdHlwZS5fYXN5bmNWYWxpZGF0ZSA9IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSwgY2FsbGJhY2spIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dGhpcy51c2VyQ29kZSA9IHNjaGVtYS5jb2RlIHx8IG51bGw7XG5cdFx0dGhpcy51c2VyRXJyb3IgPSBzY2hlbWEuZXJyb3IgfHwgbnVsbDtcblx0XHR0aGlzLnVzZXJBbGlhcyA9IHNjaGVtYS5hbGlhcyB8fCBudWxsO1xuXG5cdFx0YXN5bmMuc2VyaWVzKFtcblx0XHRcdGZ1bmN0aW9uIChuZXh0KSB7XG5cdFx0XHRcdGFzeW5jLmVhY2hTZXJpZXMoT2JqZWN0LmtleXMoX3ZhbGlkYXRpb25BdHRyaWJ1dCksIGZ1bmN0aW9uIChpLCBkb25lKSB7XG5cdFx0XHRcdFx0YXN5bmMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aWYgKChpIGluIHNjaGVtYSB8fCBpID09PSAnb3B0aW9uYWwnKSAmJiB0eXBlb2Ygc2VsZltpXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRpZiAoc2VsZltpXS5sZW5ndGggPiAyKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbGZbaV0oc2NoZW1hLCBjYW5kaWRhdGUsIGRvbmUpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHNlbGZbaV0oc2NoZW1hLCBjYW5kaWRhdGUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9LCBuZXh0KTtcblx0XHRcdH0sXG5cdFx0XHRmdW5jdGlvbiAobmV4dCkge1xuXHRcdFx0XHRhc3luYy5lYWNoU2VyaWVzKE9iamVjdC5rZXlzKHNlbGYuX2N1c3RvbSksIGZ1bmN0aW9uIChpLCBkb25lKSB7XG5cdFx0XHRcdFx0YXN5bmMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aWYgKGkgaW4gc2NoZW1hICYmIHR5cGVvZiBzZWxmLl9jdXN0b21baV0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHNlbGYuX2N1c3RvbVtpXS5sZW5ndGggPiAyKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHNlbGYuX2N1c3RvbVtpXS5jYWxsKHNlbGYsIHNjaGVtYSwgY2FuZGlkYXRlLCBkb25lKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRzZWxmLl9jdXN0b21baV0uY2FsbChzZWxmLCBzY2hlbWEsIGNhbmRpZGF0ZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRkb25lKCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0sIG5leHQpO1xuXHRcdFx0fVxuXHRcdF0sIGNhbGxiYWNrKTtcblx0fTtcblxuLy8gU2FuaXRpemF0aW9uIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gZnVuY3Rpb25zIGNhbGxlZCBieSBfc2FuaXRpemF0aW9uLnR5cGUgbWV0aG9kLlxuXHR2YXIgX2ZvcmNlVHlwZSA9IHtcblx0XHRudW1iZXI6IGZ1bmN0aW9uIChwb3N0LCBzY2hlbWEpIHtcblx0XHRcdHZhciBuO1xuXHRcdFx0aWYgKHR5cGVvZiBwb3N0ID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBvc3QgPT09ICcnKSB7XG5cdFx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hLmRlZiAhPT0gJ3VuZGVmaW5lZCcpXG5cdFx0XHRcdFx0cmV0dXJuIHNjaGVtYS5kZWY7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIHBvc3QgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdG4gPSBwYXJzZUZsb2F0KHBvc3QucmVwbGFjZSgvLC9nLCAnLicpLnJlcGxhY2UoLyAvZywgJycpKTtcblx0XHRcdFx0aWYgKHR5cGVvZiBuID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRcdHJldHVybiBuO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChwb3N0IGluc3RhbmNlb2YgRGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gK3Bvc3Q7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9LFxuXHRcdGludGVnZXI6IGZ1bmN0aW9uIChwb3N0LCBzY2hlbWEpIHtcblx0XHRcdHZhciBuO1xuXHRcdFx0aWYgKHR5cGVvZiBwb3N0ID09PSAnbnVtYmVyJyAmJiBwb3N0ICUgMSA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBvc3QgPT09ICcnKSB7XG5cdFx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hLmRlZiAhPT0gJ3VuZGVmaW5lZCcpXG5cdFx0XHRcdFx0cmV0dXJuIHNjaGVtYS5kZWY7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIHBvc3QgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdG4gPSBwYXJzZUludChwb3N0LnJlcGxhY2UoLyAvZywgJycpLCAxMCk7XG5cdFx0XHRcdGlmICh0eXBlb2YgbiA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0XHRyZXR1cm4gbjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIHBvc3QgPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdHJldHVybiBwYXJzZUludChwb3N0LCAxMCk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmICh0eXBlb2YgcG9zdCA9PT0gJ2Jvb2xlYW4nKSB7XG5cdFx0XHRcdGlmIChwb3N0KSB7IHJldHVybiAxOyB9XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocG9zdCBpbnN0YW5jZW9mIERhdGUpIHtcblx0XHRcdFx0cmV0dXJuICtwb3N0O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSxcblx0XHRzdHJpbmc6IGZ1bmN0aW9uIChwb3N0LCBzY2hlbWEpIHtcblx0XHRcdGlmICh0eXBlb2YgcG9zdCA9PT0gJ2Jvb2xlYW4nIHx8IHR5cGVvZiBwb3N0ID09PSAnbnVtYmVyJyB8fCBwb3N0IGluc3RhbmNlb2YgRGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdC50b1N0cmluZygpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoX3R5cGVJcy5hcnJheShwb3N0KSkge1xuXHRcdFx0XHQvLyBJZiB1c2VyIGF1dGhvcml6ZSBhcnJheSBhbmQgc3RyaW5ncy4uLlxuXHRcdFx0XHRpZiAoc2NoZW1hLml0ZW1zIHx8IHNjaGVtYS5wcm9wZXJ0aWVzKVxuXHRcdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0XHRyZXR1cm4gcG9zdC5qb2luKFN0cmluZyhzY2hlbWEuam9pbldpdGggfHwgJywnKSk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChwb3N0IGluc3RhbmNlb2YgT2JqZWN0KSB7XG5cdFx0XHRcdC8vIElmIHVzZXIgYXV0aG9yaXplIG9iamVjdHMgYW5zIHN0cmluZ3MuLi5cblx0XHRcdFx0aWYgKHNjaGVtYS5pdGVtcyB8fCBzY2hlbWEucHJvcGVydGllcylcblx0XHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KHBvc3QpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIHBvc3QgPT09ICdzdHJpbmcnICYmIHBvc3QubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSxcblx0XHRkYXRlOiBmdW5jdGlvbiAocG9zdCwgc2NoZW1hKSB7XG5cdFx0XHRpZiAocG9zdCBpbnN0YW5jZW9mIERhdGUpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0dmFyIGQgPSBuZXcgRGF0ZShwb3N0KTtcblx0XHRcdFx0aWYgKCFpc05hTihkLmdldFRpbWUoKSkpIHsgLy8gaWYgdmFsaWQgZGF0ZVxuXHRcdFx0XHRcdHJldHVybiBkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9LFxuXHRcdGJvb2xlYW46IGZ1bmN0aW9uIChwb3N0LCBzY2hlbWEpIHtcblx0XHRcdGlmICh0eXBlb2YgcG9zdCA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybiBudWxsO1xuXHRcdFx0aWYgKHR5cGVvZiBwb3N0ID09PSAnc3RyaW5nJyAmJiBwb3N0LnRvTG93ZXJDYXNlKCkgPT09ICdmYWxzZScpIHJldHVybiBmYWxzZTtcblx0XHRcdHJldHVybiAhIXBvc3Q7XG5cdFx0fSxcblx0XHRvYmplY3Q6IGZ1bmN0aW9uIChwb3N0LCBzY2hlbWEpIHtcblx0XHRcdGlmICh0eXBlb2YgcG9zdCAhPT0gJ3N0cmluZycgfHwgX3R5cGVJcy5vYmplY3QocG9zdCkpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5wYXJzZShwb3N0KTtcblx0XHRcdH1cblx0XHRcdGNhdGNoIChlKSB7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0YXJyYXk6IGZ1bmN0aW9uIChwb3N0LCBzY2hlbWEpIHtcblx0XHRcdGlmIChfdHlwZUlzLmFycmF5KHBvc3QpKVxuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdGlmICh0eXBlb2YgcG9zdCA9PT0gJ3VuZGVmaW5lZCcpXG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0aWYgKHR5cGVvZiBwb3N0ID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRpZiAocG9zdC5zdWJzdHJpbmcoMCwxKSA9PT0gJ1snICYmIHBvc3Quc2xpY2UoLTEpID09PSAnXScpIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIEpTT04ucGFyc2UocG9zdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHBvc3Quc3BsaXQoU3RyaW5nKHNjaGVtYS5zcGxpdFdpdGggfHwgJywnKSk7XG5cblx0XHRcdH1cblx0XHRcdGlmICghX3R5cGVJcy5hcnJheShwb3N0KSlcblx0XHRcdFx0cmV0dXJuIFsgcG9zdCBdO1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBfYXBwbHlSdWxlcyA9IHtcblx0XHR1cHBlcjogZnVuY3Rpb24gKHBvc3QpIHtcblx0XHRcdHJldHVybiBwb3N0LnRvVXBwZXJDYXNlKCk7XG5cdFx0fSxcblx0XHRsb3dlcjogZnVuY3Rpb24gKHBvc3QpIHtcblx0XHRcdHJldHVybiBwb3N0LnRvTG93ZXJDYXNlKCk7XG5cdFx0fSxcblx0XHR0aXRsZTogZnVuY3Rpb24gKHBvc3QpIHtcblx0XHRcdC8vIEZpeCBieSBzZWIgKHJlcGxhY2UgXFx3XFxTKiBieSBcXFMqID0+IGV4ZW1wbGUgOiBjb3Vjb3Ugw6dhIHZhKVxuXHRcdFx0cmV0dXJuIHBvc3QucmVwbGFjZSgvXFxTKi9nLCBmdW5jdGlvbiAodHh0KSB7XG5cdFx0XHRcdHJldHVybiB0eHQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB0eHQuc3Vic3RyKDEpLnRvTG93ZXJDYXNlKCk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGNhcGl0YWxpemU6IGZ1bmN0aW9uIChwb3N0KSB7XG5cdFx0XHRyZXR1cm4gcG9zdC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHBvc3Quc3Vic3RyKDEpLnRvTG93ZXJDYXNlKCk7XG5cdFx0fSxcblx0XHR1Y2ZpcnN0OiBmdW5jdGlvbiAocG9zdCkge1xuXHRcdFx0cmV0dXJuIHBvc3QuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwb3N0LnN1YnN0cigxKTtcblx0XHR9LFxuXHRcdHRyaW06IGZ1bmN0aW9uIChwb3N0KSB7XG5cdFx0XHRyZXR1cm4gcG9zdC50cmltKCk7XG5cdFx0fVxuXHR9O1xuXG5cdC8vIEV2ZXJ5IGZ1bmN0aW9uIHJldHVybiB0aGUgZnV0dXJlIHZhbHVlIG9mIGVhY2ggcHJvcGVydHkuIFRoZXJlZm9yZSB5b3Vcblx0Ly8gaGF2ZSB0byByZXR1cm4gcG9zdCBldmVuIGlmIHlvdSBkbyBub3QgY2hhbmdlIGl0cyB2YWx1ZVxuXHR2YXIgX3Nhbml0aXphdGlvbkF0dHJpYnV0ID0ge1xuXHRcdHN0cmljdDogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCkge1xuXHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEuc3RyaWN0ID09PSAnc3RyaW5nJykgeyBzY2hlbWEuc3RyaWN0ID0gKHNjaGVtYS5zdHJpY3QgPT09ICd0cnVlJyk7IH1cblx0XHRcdGlmIChzY2hlbWEuc3RyaWN0ICE9PSB0cnVlKVxuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdGlmICghX3R5cGVJcy5vYmplY3Qoc2NoZW1hLnByb3BlcnRpZXMpKVxuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdGlmICghX3R5cGVJcy5vYmplY3QocG9zdCkpXG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0dmFyIHRoYXQgPSB0aGlzO1xuXHRcdFx0T2JqZWN0LmtleXMocG9zdCkuZm9yRWFjaChmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdGlmICghKGtleSBpbiBzY2hlbWEucHJvcGVydGllcykpIHtcblx0XHRcdFx0XHRkZWxldGUgcG9zdFtrZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBwb3N0O1xuXHRcdH0sXG5cdFx0b3B0aW9uYWw6IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QpIHtcblx0XHRcdHZhciBvcHQgPSB0eXBlb2Ygc2NoZW1hLm9wdGlvbmFsID09PSAnYm9vbGVhbicgPyBzY2hlbWEub3B0aW9uYWwgOiAoc2NoZW1hLm9wdGlvbmFsICE9PSAnZmFsc2UnKTsgLy8gRGVmYXVsdDogdHJ1ZVxuXHRcdFx0aWYgKG9wdCA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdGlmICh0eXBlb2YgcG9zdCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnJlcG9ydCgpO1xuXHRcdFx0aWYgKHNjaGVtYS5kZWYgPT09IERhdGUpIHtcblx0XHRcdFx0cmV0dXJuIG5ldyBEYXRlKCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gc2NoZW1hLmRlZjtcblx0XHR9LFxuXHRcdHR5cGU6IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QpIHtcblx0XHRcdC8vIGlmIChfdHlwZUlzWydvYmplY3QnXShwb3N0KSB8fCBfdHlwZUlzLmFycmF5KHBvc3QpKSB7XG5cdFx0XHQvLyBcdHJldHVybiBwb3N0O1xuXHRcdFx0Ly8gfVxuXHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEudHlwZSAhPT0gJ3N0cmluZycgfHwgdHlwZW9mIF9mb3JjZVR5cGVbc2NoZW1hLnR5cGVdICE9PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0dmFyIG47XG5cdFx0XHR2YXIgb3B0ID0gdHlwZW9mIHNjaGVtYS5vcHRpb25hbCA9PT0gJ2Jvb2xlYW4nID8gc2NoZW1hLm9wdGlvbmFsIDogdHJ1ZTtcblx0XHRcdGlmICh0eXBlb2YgX2ZvcmNlVHlwZVtzY2hlbWEudHlwZV0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0biA9IF9mb3JjZVR5cGVbc2NoZW1hLnR5cGVdKHBvc3QsIHNjaGVtYSk7XG5cdFx0XHRcdGlmICgobiA9PT0gbnVsbCAmJiAhb3B0KSB8fCAoIW4gJiYgaXNOYU4obikpIHx8IChuID09PSBudWxsICYmIHNjaGVtYS50eXBlID09PSAnc3RyaW5nJykpIHtcblx0XHRcdFx0XHRuID0gc2NoZW1hLmRlZjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAoIW9wdCkge1xuXHRcdFx0XHRuID0gc2NoZW1hLmRlZjtcblx0XHRcdH1cblx0XHRcdGlmICgobiAhPSBudWxsIHx8ICh0eXBlb2Ygc2NoZW1hLmRlZiAhPT0gJ3VuZGVmaW5lZCcgJiYgc2NoZW1hLmRlZiA9PT0gbikpICYmIG4gIT09IHBvc3QpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoKTtcblx0XHRcdFx0cmV0dXJuIG47XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcG9zdDtcblx0XHR9LFxuXHRcdHJ1bGVzOiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0KSB7XG5cdFx0XHR2YXIgcnVsZXMgPSBzY2hlbWEucnVsZXM7XG5cdFx0XHRpZiAodHlwZW9mIHBvc3QgIT09ICdzdHJpbmcnIHx8ICh0eXBlb2YgcnVsZXMgIT09ICdzdHJpbmcnICYmICFfdHlwZUlzLmFycmF5KHJ1bGVzKSkpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHR2YXIgbW9kaWZpZWQgPSBmYWxzZTtcblx0XHRcdChfdHlwZUlzLmFycmF5KHJ1bGVzKSA/IHJ1bGVzIDogW3J1bGVzXSkuZm9yRWFjaChmdW5jdGlvbiAocnVsZSkge1xuXHRcdFx0XHRpZiAodHlwZW9mIF9hcHBseVJ1bGVzW3J1bGVdID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0cG9zdCA9IF9hcHBseVJ1bGVzW3J1bGVdKHBvc3QpO1xuXHRcdFx0XHRcdG1vZGlmaWVkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRpZiAobW9kaWZpZWQpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwb3N0O1xuXHRcdH0sXG5cdFx0bWluOiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0KSB7XG5cdFx0XHR2YXIgcG9zdFRlc3QgPSBOdW1iZXIocG9zdCk7XG5cdFx0XHRpZiAoaXNOYU4ocG9zdFRlc3QpKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0dmFyIG1pbiA9IE51bWJlcihzY2hlbWEubWluKTtcblx0XHRcdGlmIChpc05hTihtaW4pKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBvc3RUZXN0IDwgbWluKSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCk7XG5cdFx0XHRcdHJldHVybiBtaW47XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcG9zdDtcblx0XHR9LFxuXHRcdG1heDogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCkge1xuXHRcdFx0dmFyIHBvc3RUZXN0ID0gTnVtYmVyKHBvc3QpO1xuXHRcdFx0aWYgKGlzTmFOKHBvc3RUZXN0KSkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdHZhciBtYXggPSBOdW1iZXIoc2NoZW1hLm1heCk7XG5cdFx0XHRpZiAoaXNOYU4obWF4KSkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdGlmIChwb3N0VGVzdCA+IG1heCkge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgpO1xuXHRcdFx0XHRyZXR1cm4gbWF4O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0fSxcblx0XHRtaW5MZW5ndGg6IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QpIHtcblx0XHRcdHZhciBsaW1pdCA9IE51bWJlcihzY2hlbWEubWluTGVuZ3RoKTtcblx0XHRcdGlmICh0eXBlb2YgcG9zdCAhPT0gJ3N0cmluZycgfHwgaXNOYU4obGltaXQpIHx8IGxpbWl0IDwgMCkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdHZhciBzdHIgPSAnJztcblx0XHRcdHZhciBnYXAgPSBsaW1pdCAtIHBvc3QubGVuZ3RoO1xuXHRcdFx0aWYgKGdhcCA+IDApIHtcblx0XHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBnYXA7IGkrKykge1xuXHRcdFx0XHRcdHN0ciArPSAnLSc7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5yZXBvcnQoKTtcblx0XHRcdFx0cmV0dXJuIHBvc3QgKyBzdHI7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcG9zdDtcblx0XHR9LFxuXHRcdG1heExlbmd0aDogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCkge1xuXHRcdFx0dmFyIGxpbWl0ID0gTnVtYmVyKHNjaGVtYS5tYXhMZW5ndGgpO1xuXHRcdFx0aWYgKHR5cGVvZiBwb3N0ICE9PSAnc3RyaW5nJyB8fCBpc05hTihsaW1pdCkgfHwgbGltaXQgPCAwKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0aWYgKHBvc3QubGVuZ3RoID4gbGltaXQpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoKTtcblx0XHRcdFx0cmV0dXJuIHBvc3Quc2xpY2UoMCwgbGltaXQpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0fSxcblx0XHRwcm9wZXJ0aWVzOiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0LCBjYWxsYmFjaykge1xuXHRcdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5hc3luY1Byb3BlcnRpZXMoc2NoZW1hLCBwb3N0LCBjYWxsYmFjayk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIXBvc3QgfHwgdHlwZW9mIHBvc3QgIT09ICdvYmplY3QnKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0dmFyIHByb3BlcnRpZXMgPSBzY2hlbWEucHJvcGVydGllcztcblx0XHRcdHZhciB0bXA7XG5cdFx0XHR2YXIgaTtcblx0XHRcdGlmICh0eXBlb2YgcHJvcGVydGllc1snKiddICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRmb3IgKGkgaW4gcG9zdCkge1xuXHRcdFx0XHRcdGlmIChpIGluIHByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLl9kZWVwZXJPYmplY3QoaSk7XG5cdFx0XHRcdFx0dG1wID0gdGhpcy5fc2FuaXRpemUoc2NoZW1hLnByb3BlcnRpZXNbJyonXSwgcG9zdFtpXSk7XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiB0bXAgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHRwb3N0W2ldPSB0bXA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuX2JhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Zm9yIChpIGluIHNjaGVtYS5wcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGlmIChpICE9PSAnKicpIHtcblx0XHRcdFx0XHR0aGlzLl9kZWVwZXJPYmplY3QoaSk7XG5cdFx0XHRcdFx0dG1wID0gdGhpcy5fc2FuaXRpemUoc2NoZW1hLnByb3BlcnRpZXNbaV0sIHBvc3RbaV0pO1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgdG1wICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0cG9zdFtpXT0gdG1wO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLl9iYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBwb3N0O1xuXHRcdH0sXG5cdFx0aXRlbXM6IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmFzeW5jSXRlbXMoc2NoZW1hLCBwb3N0LCBjYWxsYmFjayk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIShzY2hlbWEuaXRlbXMgaW5zdGFuY2VvZiBPYmplY3QpIHx8ICEocG9zdCBpbnN0YW5jZW9mIE9iamVjdCkpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHR2YXIgaTtcblx0XHRcdGlmIChfdHlwZUlzLmFycmF5KHNjaGVtYS5pdGVtcykgJiYgX3R5cGVJcy5hcnJheShwb3N0KSkge1xuXHRcdFx0XHR2YXIgbWluTGVuZ3RoID0gc2NoZW1hLml0ZW1zLmxlbmd0aCA8IHBvc3QubGVuZ3RoID8gc2NoZW1hLml0ZW1zLmxlbmd0aCA6IHBvc3QubGVuZ3RoO1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgbWluTGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHR0aGlzLl9kZWVwZXJBcnJheShpKTtcblx0XHRcdFx0XHRwb3N0W2ldID0gdGhpcy5fc2FuaXRpemUoc2NoZW1hLml0ZW1zW2ldLCBwb3N0W2ldKTtcblx0XHRcdFx0XHR0aGlzLl9iYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRmb3IgKGkgaW4gcG9zdCkge1xuXHRcdFx0XHRcdHRoaXMuX2RlZXBlckFycmF5KGkpO1xuXHRcdFx0XHRcdHBvc3RbaV0gPSB0aGlzLl9zYW5pdGl6ZShzY2hlbWEuaXRlbXMsIHBvc3RbaV0pO1xuXHRcdFx0XHRcdHRoaXMuX2JhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0fSxcblx0XHRleGVjOiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0LCBjYWxsYmFjaykge1xuXHRcdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5hc3luY0V4ZWMoc2NoZW1hLCBwb3N0LCBjYWxsYmFjayk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgZXhlY3MgPSBfdHlwZUlzLmFycmF5KHNjaGVtYS5leGVjKSA/IHNjaGVtYS5leGVjIDogW3NjaGVtYS5leGVjXTtcblxuXHRcdFx0ZXhlY3MuZm9yRWFjaChmdW5jdGlvbiAoZXhlYykge1xuXHRcdFx0XHRpZiAodHlwZW9mIGV4ZWMgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRwb3N0ID0gZXhlYy5jYWxsKHRoaXMsIHNjaGVtYSwgcG9zdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0sIHRoaXMpO1xuXHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0fVxuXHR9O1xuXG5cdHZhciBfYXN5bmNTYW5pdGl6YXRpb25BdHRyaWJ1dCA9IHtcblx0XHRhc3luY0V4ZWM6IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHR2YXIgZXhlY3MgPSBfdHlwZUlzLmFycmF5KHNjaGVtYS5leGVjKSA/IHNjaGVtYS5leGVjIDogW3NjaGVtYS5leGVjXTtcblxuXHRcdFx0YXN5bmMuZWFjaFNlcmllcyhleGVjcywgZnVuY3Rpb24gKGV4ZWMsIGRvbmUpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBleGVjID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0aWYgKGV4ZWMubGVuZ3RoID4gMikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGV4ZWMuY2FsbChzZWxmLCBzY2hlbWEsIHBvc3QsIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuXHRcdFx0XHRcdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGRvbmUoZXJyKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRwb3N0ID0gcmVzO1xuXHRcdFx0XHRcdFx0XHRkb25lKCk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cG9zdCA9IGV4ZWMuY2FsbChzZWxmLCBzY2hlbWEsIHBvc3QpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGRvbmUoKTtcblx0XHRcdH0sIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0Y2FsbGJhY2soZXJyLCBwb3N0KTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0YXN5bmNQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0LCBjYWxsYmFjaykge1xuXHRcdFx0aWYgKCFwb3N0IHx8IHR5cGVvZiBwb3N0ICE9PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRyZXR1cm4gY2FsbGJhY2sobnVsbCwgcG9zdCk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHR2YXIgcHJvcGVydGllcyA9IHNjaGVtYS5wcm9wZXJ0aWVzO1xuXG5cdFx0XHRhc3luYy5zZXJpZXMoW1xuXHRcdFx0XHRmdW5jdGlvbiAobmV4dCkge1xuXHRcdFx0XHRcdGlmIChwcm9wZXJ0aWVzWycqJ10gPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG5leHQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dmFyIGdsb2JpbmcgPSBwcm9wZXJ0aWVzWycqJ107XG5cdFx0XHRcdFx0YXN5bmMuZWFjaFNlcmllcyhPYmplY3Qua2V5cyhwb3N0KSwgZnVuY3Rpb24gKGksIG5leHQpIHtcblx0XHRcdFx0XHRcdGlmIChpIGluIHByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5leHQoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNlbGYuX2RlZXBlck9iamVjdChpKTtcblx0XHRcdFx0XHRcdHNlbGYuX2FzeW5jU2FuaXRpemUoZ2xvYmluZywgcG9zdFtpXSwgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChlcnIpIHsgLyogRXJyb3IgY2FuIHNhZmVseSBiZSBpZ25vcmVkIGhlcmUgKi8gfVxuXHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIHJlcyAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdFx0XHRwb3N0W2ldID0gcmVzO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHNlbGYuX2JhY2soKTtcblx0XHRcdFx0XHRcdFx0bmV4dCgpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSwgbmV4dCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZ1bmN0aW9uIChuZXh0KSB7XG5cdFx0XHRcdFx0YXN5bmMuZWFjaFNlcmllcyhPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKSwgZnVuY3Rpb24gKGksIG5leHQpIHtcblx0XHRcdFx0XHRcdGlmIChpID09PSAnKicpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5leHQoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNlbGYuX2RlZXBlck9iamVjdChpKTtcblx0XHRcdFx0XHRcdHNlbGYuX2FzeW5jU2FuaXRpemUocHJvcGVydGllc1tpXSwgcG9zdFtpXSwgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV4dChlcnIpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGlmICh0eXBlb2YgcmVzICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0XHRcdHBvc3RbaV0gPSByZXM7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0c2VsZi5fYmFjaygpO1xuXHRcdFx0XHRcdFx0XHRuZXh0KCk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9LCBuZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0XSwgZnVuY3Rpb24gKGVycikge1xuXHRcdFx0XHRyZXR1cm4gY2FsbGJhY2soZXJyLCBwb3N0KTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0YXN5bmNJdGVtczogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCwgY2FsbGJhY2spIHtcblx0XHRcdGlmICghKHNjaGVtYS5pdGVtcyBpbnN0YW5jZW9mIE9iamVjdCkgfHwgIShwb3N0IGluc3RhbmNlb2YgT2JqZWN0KSkge1xuXHRcdFx0XHRyZXR1cm4gY2FsbGJhY2sobnVsbCwgcG9zdCk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHR2YXIgaXRlbXMgPSBzY2hlbWEuaXRlbXM7XG5cdFx0XHRpZiAoX3R5cGVJcy5hcnJheShpdGVtcykgJiYgX3R5cGVJcy5hcnJheShwb3N0KSkge1xuXHRcdFx0XHR2YXIgbWluTGVuZ3RoID0gaXRlbXMubGVuZ3RoIDwgcG9zdC5sZW5ndGggPyBpdGVtcy5sZW5ndGggOiBwb3N0Lmxlbmd0aDtcblx0XHRcdFx0YXN5bmMudGltZXNTZXJpZXMobWluTGVuZ3RoLCBmdW5jdGlvbiAoaSwgbmV4dCkge1xuXHRcdFx0XHRcdHNlbGYuX2RlZXBlckFycmF5KGkpO1xuXHRcdFx0XHRcdHNlbGYuX2FzeW5jU2FuaXRpemUoaXRlbXNbaV0sIHBvc3RbaV0sIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuXHRcdFx0XHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV4dChlcnIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cG9zdFtpXSA9IHJlcztcblx0XHRcdFx0XHRcdHNlbGYuX2JhY2soKTtcblx0XHRcdFx0XHRcdG5leHQoKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSwgZnVuY3Rpb24gKGVycikge1xuXHRcdFx0XHRcdGNhbGxiYWNrKGVyciwgcG9zdCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGFzeW5jLmVhY2hTZXJpZXMoT2JqZWN0LmtleXMocG9zdCksIGZ1bmN0aW9uIChrZXksIG5leHQpIHtcblx0XHRcdFx0XHRzZWxmLl9kZWVwZXJBcnJheShrZXkpO1xuXHRcdFx0XHRcdHNlbGYuX2FzeW5jU2FuaXRpemUoaXRlbXMsIHBvc3Rba2V5XSwgZnVuY3Rpb24gKGVyciwgcmVzKSB7XG5cdFx0XHRcdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXh0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRwb3N0W2tleV0gPSByZXM7XG5cdFx0XHRcdFx0XHRzZWxmLl9iYWNrKCk7XG5cdFx0XHRcdFx0XHRuZXh0KCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0XHRjYWxsYmFjayhlcnIsIHBvc3QpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwb3N0O1xuXHRcdH1cblx0fTtcblxuXHQvLyBTYW5pdGl6YXRpb24gQ2xhc3MgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0Ly8gaW5oZXJpdHMgZnJvbSBJbnNwZWN0aW9uIGNsYXNzIChhY3R1YWxseSB3ZSBqdXN0IGNhbGwgSW5zcGVjdGlvblxuXHQvLyBjb25zdHJ1Y3RvciB3aXRoIHRoZSBuZXcgY29udGV4dCwgYmVjYXVzZSBpdHMgcHJvdG90eXBlIGlzIGVtcHR5XG5cdGZ1bmN0aW9uIFNhbml0aXphdGlvbihzY2hlbWEsIGN1c3RvbSkge1xuXHRcdEluc3BlY3Rpb24ucHJvdG90eXBlLmNvbnN0cnVjdG9yLmNhbGwodGhpcywgc2NoZW1hLCBfbWVyZ2UoU2FuaXRpemF0aW9uLmN1c3RvbSwgY3VzdG9tKSk7XG5cdFx0dmFyIF9yZXBvcnRpbmcgPSBbXTtcblxuXHRcdHRoaXMuX2Jhc2ljRmllbGRzID0gT2JqZWN0LmtleXMoX3Nhbml0aXphdGlvbkF0dHJpYnV0KTtcblx0XHR0aGlzLl9jdXN0b21GaWVsZHMgPSBPYmplY3Qua2V5cyh0aGlzLl9jdXN0b20pO1xuXHRcdHRoaXMub3JpZ2luID0gbnVsbDtcblxuXHRcdHRoaXMucmVwb3J0ID0gZnVuY3Rpb24gKG1lc3NhZ2UpIHtcblx0XHRcdHZhciBuZXdOb3QgPSB7XG5cdFx0XHRcdFx0bWVzc2FnZTogbWVzc2FnZSB8fCAnd2FzIHNhbml0aXplZCcsXG5cdFx0XHRcdFx0cHJvcGVydHk6IHRoaXMudXNlckFsaWFzID8gKHRoaXMudXNlckFsaWFzICsgJyAoJyArIHRoaXMuX2R1bXBTdGFjaygpICsgJyknKSA6IHRoaXMuX2R1bXBTdGFjaygpXG5cdFx0XHR9O1xuXHRcdFx0aWYgKCFfcmVwb3J0aW5nLnNvbWUoZnVuY3Rpb24gKGUpIHsgcmV0dXJuIGUucHJvcGVydHkgPT09IG5ld05vdC5wcm9wZXJ0eTsgfSkpIHtcblx0XHRcdFx0X3JlcG9ydGluZy5wdXNoKG5ld05vdCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdHRoaXMucmVzdWx0ID0gZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGRhdGE6IGRhdGEsXG5cdFx0XHRcdHJlcG9ydGluZzogX3JlcG9ydGluZyxcblx0XHRcdFx0Zm9ybWF0OiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRoaXMucmVwb3J0aW5nLm1hcChmdW5jdGlvbiAoaSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICdQcm9wZXJ0eSAnICsgaS5wcm9wZXJ0eSArICcgJyArIGkubWVzc2FnZTtcblx0XHRcdFx0XHR9KS5qb2luKCdcXG4nKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9O1xuXHR9XG5cblx0X2V4dGVuZChTYW5pdGl6YXRpb24ucHJvdG90eXBlLCBfc2FuaXRpemF0aW9uQXR0cmlidXQpO1xuXHRfZXh0ZW5kKFNhbml0aXphdGlvbi5wcm90b3R5cGUsIF9hc3luY1Nhbml0aXphdGlvbkF0dHJpYnV0KTtcblx0X2V4dGVuZChTYW5pdGl6YXRpb24sIG5ldyBDdXN0b21pc2FibGUoKSk7XG5cblxuXHRTYW5pdGl6YXRpb24ucHJvdG90eXBlLnNhbml0aXplID0gZnVuY3Rpb24gKHBvc3QsIGNhbGxiYWNrKSB7XG5cdFx0dGhpcy5vcmlnaW4gPSBwb3N0O1xuXHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdHJldHVybiB0aGlzLl9hc3luY1Nhbml0aXplKHRoaXMuX3NjaGVtYSwgcG9zdCwgZnVuY3Rpb24gKGVyciwgZGF0YSkge1xuXHRcdFx0XHRzZWxmLm9yaWdpbiA9IG51bGw7XG5cdFx0XHRcdGNhbGxiYWNrKGVyciwgc2VsZi5yZXN1bHQoZGF0YSkpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHZhciBkYXRhID0gdGhpcy5fc2FuaXRpemUodGhpcy5fc2NoZW1hLCBwb3N0KTtcblx0XHR0aGlzLm9yaWdpbiA9IG51bGw7XG5cdFx0cmV0dXJuIHRoaXMucmVzdWx0KGRhdGEpO1xuXHR9O1xuXG5cdFNhbml0aXphdGlvbi5wcm90b3R5cGUuX3Nhbml0aXplID0gZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCkge1xuXHRcdHRoaXMudXNlckFsaWFzID0gc2NoZW1hLmFsaWFzIHx8IG51bGw7XG5cdFx0dGhpcy5fYmFzaWNGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xuXHRcdFx0aWYgKChpIGluIHNjaGVtYSB8fCBpID09PSAnb3B0aW9uYWwnKSAmJiB0eXBlb2YgdGhpc1tpXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRwb3N0ID0gdGhpc1tpXShzY2hlbWEsIHBvc3QpO1xuXHRcdFx0fVxuXHRcdH0sIHRoaXMpO1xuXHRcdHRoaXMuX2N1c3RvbUZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChpKSB7XG5cdFx0XHRpZiAoaSBpbiBzY2hlbWEgJiYgdHlwZW9mIHRoaXMuX2N1c3RvbVtpXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRwb3N0ID0gdGhpcy5fY3VzdG9tW2ldLmNhbGwodGhpcywgc2NoZW1hLCBwb3N0KTtcblx0XHRcdH1cblx0XHR9LCB0aGlzKTtcblx0XHRyZXR1cm4gcG9zdDtcblx0fTtcblxuXHRTYW5pdGl6YXRpb24ucHJvdG90eXBlLl9hc3luY1Nhbml0aXplID0gZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCwgY2FsbGJhY2spIHtcblx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0dGhpcy51c2VyQWxpYXMgPSBzY2hlbWEuYWxpYXMgfHwgbnVsbDtcblxuXHRcdGFzeW5jLndhdGVyZmFsbChbXG5cdFx0XHRmdW5jdGlvbiAobmV4dCkge1xuXHRcdFx0XHRhc3luYy5yZWR1Y2Uoc2VsZi5fYmFzaWNGaWVsZHMsIHBvc3QsIGZ1bmN0aW9uICh2YWx1ZSwgaSwgbmV4dCkge1xuXHRcdFx0XHRcdGFzeW5jLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGlmICgoaSBpbiBzY2hlbWEgfHwgaSA9PT0gJ29wdGlvbmFsJykgJiYgdHlwZW9mIHNlbGZbaV0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHNlbGZbaV0ubGVuZ3RoID4gMikge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmW2ldKHNjaGVtYSwgdmFsdWUsIG5leHQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHZhbHVlID0gc2VsZltpXShzY2hlbWEsIHZhbHVlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG5leHQobnVsbCwgdmFsdWUpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9LCBuZXh0KTtcblx0XHRcdH0sXG5cdFx0XHRmdW5jdGlvbiAoaW50ZXIsIG5leHQpIHtcblx0XHRcdFx0YXN5bmMucmVkdWNlKHNlbGYuX2N1c3RvbUZpZWxkcywgaW50ZXIsIGZ1bmN0aW9uICh2YWx1ZSwgaSwgbmV4dCkge1xuXHRcdFx0XHRcdGFzeW5jLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGlmIChpIGluIHNjaGVtYSAmJiB0eXBlb2Ygc2VsZi5fY3VzdG9tW2ldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzZWxmLl9jdXN0b21baV0ubGVuZ3RoID4gMikge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9jdXN0b21baV0uY2FsbChzZWxmLCBzY2hlbWEsIHZhbHVlLCBuZXh0KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA9IHNlbGYuX2N1c3RvbVtpXS5jYWxsKHNlbGYsIHNjaGVtYSwgdmFsdWUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0bmV4dChudWxsLCB2YWx1ZSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0sIG5leHQpO1xuXHRcdFx0fVxuXHRcdF0sIGNhbGxiYWNrKTtcblx0fTtcblxuXHQvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuXHR2YXIgSU5UX01JTiA9IC0yMTQ3NDgzNjQ4O1xuXHR2YXIgSU5UX01BWCA9IDIxNDc0ODM2NDc7XG5cblx0dmFyIF9yYW5kID0ge1xuXHRcdGludDogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG5cdFx0XHRyZXR1cm4gbWluICsgKDAgfCBNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcblx0XHR9LFxuXHRcdGZsb2F0OiBmdW5jdGlvbiAobWluLCBtYXgpIHtcblx0XHRcdHJldHVybiAoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluKTtcblx0XHR9LFxuXHRcdGJvb2w6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiAoTWF0aC5yYW5kb20oKSA+IDAuNSk7XG5cdFx0fSxcblx0XHRjaGFyOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcblx0XHRcdHJldHVybiBTdHJpbmcuZnJvbUNoYXJDb2RlKHRoaXMuaW50KG1pbiwgbWF4KSk7XG5cdFx0fSxcblx0XHRmcm9tTGlzdDogZnVuY3Rpb24gKGxpc3QpIHtcblx0XHRcdHJldHVybiBsaXN0W3RoaXMuaW50KDAsIGxpc3QubGVuZ3RoIC0gMSldO1xuXHRcdH1cblx0fTtcblxuXHR2YXIgX2Zvcm1hdFNhbXBsZSA9IHtcblx0XHQnZGF0ZS10aW1lJzogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcblx0XHR9LFxuXHRcdCdkYXRlJzogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKS5yZXBsYWNlKC9ULiokLywgJycpO1xuXHRcdH0sXG5cdFx0J3RpbWUnOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gbmV3IERhdGUoKS50b0xvY2FsZVRpbWVTdHJpbmcoe30sIHsgaG91cjEyOiBmYWxzZSB9KTtcblx0XHR9LFxuXHRcdCdjb2xvcic6IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuXHRcdFx0dmFyIHMgPSAnIyc7XG5cdFx0XHRpZiAobWluIDwgMSkge1xuXHRcdFx0XHRtaW4gPSAxO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBfcmFuZC5pbnQobWluLCBtYXgpOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHRcdHMgKz0gX3JhbmQuZnJvbUxpc3QoJzAxMjM0NTY3ODlhYmNkZWZBQkNERUYnKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzO1xuXHRcdH0sXG5cdFx0J251bWVyaWMnOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gJycgKyBfcmFuZC5pbnQoMCwgSU5UX01BWCk7XG5cdFx0fSxcblx0XHQnaW50ZWdlcic6IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmIChfcmFuZC5ib29sKCkgPT09IHRydWUpIHtcblx0XHRcdFx0cmV0dXJuICctJyArIHRoaXMubnVtZXJpYygpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMubnVtZXJpYygpO1xuXHRcdH0sXG5cdFx0J2RlY2ltYWwnOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5pbnRlZ2VyKCkgKyAnLicgKyB0aGlzLm51bWVyaWMoKTtcblx0XHR9LFxuXHRcdCdhbHBoYSc6IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuXHRcdFx0dmFyIHMgPSAnJztcblx0XHRcdGlmIChtaW4gPCAxKSB7XG5cdFx0XHRcdG1pbiA9IDE7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBpID0gMCwgbCA9IF9yYW5kLmludChtaW4sIG1heCk7IGkgPCBsOyBpKyspIHtcblx0XHRcdFx0cyArPSBfcmFuZC5mcm9tTGlzdCgnYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWicpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHM7XG5cdFx0fSxcblx0XHQnYWxwaGFOdW1lcmljJzogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG5cdFx0XHR2YXIgcyA9ICcnO1xuXHRcdFx0aWYgKG1pbiA8IDEpIHtcblx0XHRcdFx0bWluID0gMTtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGkgPSAwLCBsID0gX3JhbmQuaW50KG1pbiwgbWF4KTsgaSA8IGw7IGkrKykge1xuXHRcdFx0XHRzICs9IF9yYW5kLmZyb21MaXN0KCdhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ekFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaMDEyMzQ1Njc4OScpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHM7XG5cdFx0fSxcblx0XHQnYWxwaGFEYXNoJzogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG5cdFx0XHR2YXIgcyA9ICcnO1xuXHRcdFx0aWYgKG1pbiA8IDEpIHtcblx0XHRcdFx0bWluID0gMTtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGkgPSAwLCBsID0gX3JhbmQuaW50KG1pbiwgbWF4KTsgaSA8IGw7IGkrKykge1xuXHRcdFx0XHRzICs9IF9yYW5kLmZyb21MaXN0KCdfLWFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6Xy1BQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWl8tMDEyMzQ1Njc4OV8tJyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcztcblx0XHR9LFxuXHRcdCdqYXZhc2NyaXB0JzogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG5cdFx0XHR2YXIgcyA9IF9yYW5kLmZyb21MaXN0KCdfJGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XyRBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWl8kJyk7XG5cdFx0XHRmb3IgKHZhciBpID0gMCwgbCA9IF9yYW5kLmludChtaW4sIG1heCAtIDEpOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHRcdHMgKz0gX3JhbmQuZnJvbUxpc3QoJ18kYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpfJEFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaXyQwMTIzNDU2Nzg5XyQnKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzO1xuXHRcdH1cblx0fTtcblxuXHRmdW5jdGlvbiBfZ2V0TGltaXRzKHNjaGVtYSkge1xuXHRcdHZhciBtaW4gPSBJTlRfTUlOO1xuXHRcdHZhciBtYXggPSBJTlRfTUFYO1xuXG5cdFx0aWYgKHNjaGVtYS5ndGUgIT0gbnVsbCkge1xuXHRcdFx0bWluID0gc2NoZW1hLmd0ZTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoc2NoZW1hLmd0ICE9IG51bGwpIHtcblx0XHRcdG1pbiA9IHNjaGVtYS5ndCArIDE7XG5cdFx0fVxuXHRcdGlmIChzY2hlbWEubHRlICE9IG51bGwpIHtcblx0XHRcdG1heCA9IHNjaGVtYS5sdGU7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKHNjaGVtYS5sdCAhPSBudWxsKSB7XG5cdFx0XHRtYXggPSBzY2hlbWEubHQgLSAxO1xuXHRcdH1cblx0XHRyZXR1cm4geyBtaW46IG1pbiwgbWF4OiBtYXggfTtcblx0fVxuXG5cdHZhciBfdHlwZUdlbmVyYXRvciA9IHtcblx0XHRzdHJpbmc6IGZ1bmN0aW9uIChzY2hlbWEpIHtcblx0XHRcdGlmIChzY2hlbWEuZXEgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gc2NoZW1hLmVxO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHMgPSAnJztcblx0XHRcdHZhciBtaW5MZW5ndGggPSBzY2hlbWEubWluTGVuZ3RoICE9IG51bGwgPyBzY2hlbWEubWluTGVuZ3RoIDogMDtcblx0XHRcdHZhciBtYXhMZW5ndGggPSBzY2hlbWEubWF4TGVuZ3RoICE9IG51bGwgPyBzY2hlbWEubWF4TGVuZ3RoIDogMzI7XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYS5wYXR0ZXJuID09PSAnc3RyaW5nJyAmJiB0eXBlb2YgX2Zvcm1hdFNhbXBsZVtzY2hlbWEucGF0dGVybl0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cmV0dXJuIF9mb3JtYXRTYW1wbGVbc2NoZW1hLnBhdHRlcm5dKG1pbkxlbmd0aCwgbWF4TGVuZ3RoKTtcblx0XHRcdH1cblxuXHRcdFx0dmFyIGwgPSBzY2hlbWEuZXhhY3RMZW5ndGggIT0gbnVsbCA/IHNjaGVtYS5leGFjdExlbmd0aCA6IF9yYW5kLmludChtaW5MZW5ndGgsIG1heExlbmd0aCk7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuXHRcdFx0XHRzICs9IF9yYW5kLmNoYXIoMzIsIDEyNik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcztcblx0XHR9LFxuXHRcdG51bWJlcjogZnVuY3Rpb24gKHNjaGVtYSkge1xuXHRcdFx0aWYgKHNjaGVtYS5lcSAhPSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBzY2hlbWEuZXE7XG5cdFx0XHR9XG5cdFx0XHR2YXIgbGltaXQgPSBfZ2V0TGltaXRzKHNjaGVtYSk7XG5cdFx0XHR2YXIgbiA9IF9yYW5kLmZsb2F0KGxpbWl0Lm1pbiwgbGltaXQubWF4KTtcblx0XHRcdGlmIChzY2hlbWEubmUgIT0gbnVsbCkge1xuXHRcdFx0XHR2YXIgbmUgPSBfdHlwZUlzLmFycmF5KHNjaGVtYS5uZSkgPyBzY2hlbWEubmUgOiBbc2NoZW1hLm5lXTtcblx0XHRcdFx0d2hpbGUgKG5lLmluZGV4T2YobikgIT09IC0xKSB7XG5cdFx0XHRcdFx0biA9IF9yYW5kLmZsb2F0KGxpbWl0Lm1pbiwgbGltaXQubWF4KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG47XG5cdFx0fSxcblx0XHRpbnRlZ2VyOiBmdW5jdGlvbiAoc2NoZW1hKSB7XG5cdFx0XHRpZiAoc2NoZW1hLmVxICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIHNjaGVtYS5lcTtcblx0XHRcdH1cblx0XHRcdHZhciBsaW1pdCA9IF9nZXRMaW1pdHMoc2NoZW1hKTtcblx0XHRcdHZhciBuID0gX3JhbmQuaW50KGxpbWl0Lm1pbiwgbGltaXQubWF4KTtcblx0XHRcdGlmIChzY2hlbWEubmUgIT0gbnVsbCkge1xuXHRcdFx0XHR2YXIgbmUgPSBfdHlwZUlzLmFycmF5KHNjaGVtYS5uZSkgPyBzY2hlbWEubmUgOiBbc2NoZW1hLm5lXTtcblx0XHRcdFx0d2hpbGUgKG5lLmluZGV4T2YobikgIT09IC0xKSB7XG5cdFx0XHRcdFx0biA9IF9yYW5kLmludChsaW1pdC5taW4sIGxpbWl0Lm1heCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBuO1xuXHRcdH0sXG5cdFx0Ym9vbGVhbjogZnVuY3Rpb24gKHNjaGVtYSkge1xuXHRcdFx0aWYgKHNjaGVtYS5lcSAhPSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBzY2hlbWEuZXE7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gX3JhbmQuYm9vbCgpO1xuXHRcdH0sXG5cdFx0XCJudWxsXCI6IGZ1bmN0aW9uIChzY2hlbWEpIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0sXG5cdFx0ZGF0ZTogZnVuY3Rpb24gKHNjaGVtYSkge1xuXHRcdFx0aWYgKHNjaGVtYS5lcSAhPSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBzY2hlbWEuZXE7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbmV3IERhdGUoKTtcblx0XHR9LFxuXHRcdG9iamVjdDogZnVuY3Rpb24gKHNjaGVtYSkge1xuXHRcdFx0dmFyIG8gPSB7fTtcblx0XHRcdHZhciBwcm9wID0gc2NoZW1hLnByb3BlcnRpZXMgfHwge307XG5cblx0XHRcdGZvciAodmFyIGtleSBpbiBwcm9wKSB7XG5cdFx0XHRcdGlmIChwcm9wLmhhc093blByb3BlcnR5KGtleSkpe1xuXHRcdFx0XHRcdGlmIChwcm9wW2tleV0ub3B0aW9uYWwgPT09IHRydWUgJiYgX3JhbmQuYm9vbCgpID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGtleSAhPT0gJyonKSB7XG5cdFx0XHRcdFx0XHRvW2tleV0gPSB0aGlzLmdlbmVyYXRlKHByb3Bba2V5XSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVsc2Uge1xuXHRcdFx0XHRcdFx0dmFyIHJrID0gJ19fcmFuZG9tX2tleV8nO1xuXHRcdFx0XHRcdFx0dmFyIHJhbmRvbUtleSA9IHJrICsgMDtcblx0XHRcdFx0XHRcdHZhciBuID0gX3JhbmQuaW50KDEsIDkpO1xuXHRcdFx0XHRcdFx0Zm9yICh2YXIgaSA9IDE7IGkgPD0gbjsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdGlmICghKHJhbmRvbUtleSBpbiBwcm9wKSkge1xuXHRcdFx0XHRcdFx0XHRcdG9bcmFuZG9tS2V5XSA9IHRoaXMuZ2VuZXJhdGUocHJvcFtrZXldKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyYW5kb21LZXkgPSByayArIGk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbztcblx0XHR9LFxuXHRcdGFycmF5OiBmdW5jdGlvbiAoc2NoZW1hKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHR2YXIgaXRlbXMgPSBzY2hlbWEuaXRlbXMgfHwge307XG5cdFx0XHR2YXIgbWluTGVuZ3RoID0gc2NoZW1hLm1pbkxlbmd0aCAhPSBudWxsID8gc2NoZW1hLm1pbkxlbmd0aCA6IDA7XG5cdFx0XHR2YXIgbWF4TGVuZ3RoID0gc2NoZW1hLm1heExlbmd0aCAhPSBudWxsID8gc2NoZW1hLm1heExlbmd0aCA6IDE2O1xuXHRcdFx0dmFyIHR5cGU7XG5cdFx0XHR2YXIgY2FuZGlkYXRlO1xuXHRcdFx0dmFyIHNpemU7XG5cdFx0XHR2YXIgaTtcblxuXHRcdFx0aWYgKF90eXBlSXMuYXJyYXkoaXRlbXMpKSB7XG5cdFx0XHRcdHNpemUgPSBpdGVtcy5sZW5ndGg7XG5cdFx0XHRcdGlmIChzY2hlbWEuZXhhY3RMZW5ndGggIT0gbnVsbCkge1xuXHRcdFx0XHRcdHNpemUgPSBzY2hlbWEuZXhhY3RMZW5ndGg7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoc2l6ZSA8IG1pbkxlbmd0aCkge1xuXHRcdFx0XHRcdHNpemUgPSBtaW5MZW5ndGg7XG5cdFx0XHRcdH1cblx0XHRcdFx0ZWxzZSBpZiAoc2l6ZSA+IG1heExlbmd0aCkge1xuXHRcdFx0XHRcdHNpemUgPSBtYXhMZW5ndGg7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y2FuZGlkYXRlID0gbmV3IEFycmF5KHNpemUpO1xuXHRcdFx0XHR0eXBlID0gbnVsbDtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IHNpemU7IGkrKykge1xuXHRcdFx0XHRcdHR5cGUgPSBpdGVtc1tpXS50eXBlIHx8ICdhbnknO1xuXHRcdFx0XHRcdGlmIChfdHlwZUlzLmFycmF5KHR5cGUpKSB7XG5cdFx0XHRcdFx0XHR0eXBlID0gdHlwZVtfcmFuZC5pbnQoMCwgdHlwZS5sZW5ndGggLSAxKV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhbmRpZGF0ZVtpXSA9IHNlbGZbdHlwZV0oaXRlbXNbaV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0c2l6ZSA9IHNjaGVtYS5leGFjdExlbmd0aCAhPSBudWxsID8gc2NoZW1hLmV4YWN0TGVuZ3RoIDogX3JhbmQuaW50KG1pbkxlbmd0aCwgbWF4TGVuZ3RoKTtcblx0XHRcdFx0Y2FuZGlkYXRlID0gbmV3IEFycmF5KHNpemUpO1xuXHRcdFx0XHR0eXBlID0gaXRlbXMudHlwZSB8fCAnYW55Jztcblx0XHRcdFx0aWYgKF90eXBlSXMuYXJyYXkodHlwZSkpIHtcblx0XHRcdFx0XHR0eXBlID0gdHlwZVtfcmFuZC5pbnQoMCwgdHlwZS5sZW5ndGggLSAxKV07XG5cdFx0XHRcdH1cblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IHNpemU7IGkrKykge1xuXHRcdFx0XHRcdGNhbmRpZGF0ZVtpXSA9IHNlbGZbdHlwZV0oaXRlbXMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gY2FuZGlkYXRlO1xuXHRcdH0sXG5cdFx0YW55OiBmdW5jdGlvbiAoc2NoZW1hKSB7XG5cdFx0XHR2YXIgZmllbGRzID0gT2JqZWN0LmtleXMoX3R5cGVHZW5lcmF0b3IpO1xuXHRcdFx0dmFyIGkgPSBmaWVsZHNbX3JhbmQuaW50KDAsIGZpZWxkcy5sZW5ndGggLSAyKV07XG5cdFx0XHRyZXR1cm4gdGhpc1tpXShzY2hlbWEpO1xuXHRcdH1cblx0fTtcblxuXHQvLyBDYW5kaWRhdGVHZW5lcmF0b3IgQ2xhc3MgKFNpbmdsZXRvbikgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0ZnVuY3Rpb24gQ2FuZGlkYXRlR2VuZXJhdG9yKCkge1xuXHRcdC8vIE1heWJlIGV4dGVuZHMgSW5zcGVjdGlvbiBjbGFzcyB0b28gP1xuXHR9XG5cblx0X2V4dGVuZChDYW5kaWRhdGVHZW5lcmF0b3IucHJvdG90eXBlLCBfdHlwZUdlbmVyYXRvcik7XG5cblx0dmFyIF9pbnN0YW5jZSA9IG51bGw7XG5cdENhbmRpZGF0ZUdlbmVyYXRvci5pbnN0YW5jZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAoIShfaW5zdGFuY2UgaW5zdGFuY2VvZiBDYW5kaWRhdGVHZW5lcmF0b3IpKSB7XG5cdFx0XHRfaW5zdGFuY2UgPSBuZXcgQ2FuZGlkYXRlR2VuZXJhdG9yKCk7XG5cdFx0fVxuXHRcdHJldHVybiBfaW5zdGFuY2U7XG5cdH07XG5cblx0Q2FuZGlkYXRlR2VuZXJhdG9yLnByb3RvdHlwZS5nZW5lcmF0ZSA9IGZ1bmN0aW9uIChzY2hlbWEpIHtcblx0XHR2YXIgdHlwZSA9IHNjaGVtYS50eXBlIHx8ICdhbnknO1xuXHRcdGlmIChfdHlwZUlzLmFycmF5KHR5cGUpKSB7XG5cdFx0XHR0eXBlID0gdHlwZVtfcmFuZC5pbnQoMCwgdHlwZS5sZW5ndGggLSAxKV07XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzW3R5cGVdKHNjaGVtYSk7XG5cdH07XG5cbi8vIEV4cG9ydHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdHZhciBTY2hlbWFJbnNwZWN0b3IgPSB7fTtcblxuXHQvLyBpZiBzZXJ2ZXItc2lkZSAobm9kZS5qcykgZWxzZSBjbGllbnQtc2lkZVxuXHRpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IFNjaGVtYUluc3BlY3Rvcjtcblx0fVxuXHRlbHNlIHtcblx0XHR3aW5kb3cuU2NoZW1hSW5zcGVjdG9yID0gU2NoZW1hSW5zcGVjdG9yO1xuXHR9XG5cblx0U2NoZW1hSW5zcGVjdG9yLm5ld1Nhbml0aXphdGlvbiA9IGZ1bmN0aW9uIChzY2hlbWEsIGN1c3RvbSkge1xuXHRcdHJldHVybiBuZXcgU2FuaXRpemF0aW9uKHNjaGVtYSwgY3VzdG9tKTtcblx0fTtcblxuXHRTY2hlbWFJbnNwZWN0b3IubmV3VmFsaWRhdGlvbiA9IGZ1bmN0aW9uIChzY2hlbWEsIGN1c3RvbSkge1xuXHRcdHJldHVybiBuZXcgVmFsaWRhdGlvbihzY2hlbWEsIGN1c3RvbSk7XG5cdH07XG5cblx0U2NoZW1hSW5zcGVjdG9yLlZhbGlkYXRpb24gPSBWYWxpZGF0aW9uO1xuXHRTY2hlbWFJbnNwZWN0b3IuU2FuaXRpemF0aW9uID0gU2FuaXRpemF0aW9uO1xuXG5cdFNjaGVtYUluc3BlY3Rvci5zYW5pdGl6ZSA9IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QsIGN1c3RvbSwgY2FsbGJhY2spIHtcblx0XHRpZiAoYXJndW1lbnRzLmxlbmd0aCA9PT0gMyAmJiB0eXBlb2YgY3VzdG9tID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRjYWxsYmFjayA9IGN1c3RvbTtcblx0XHRcdGN1c3RvbSA9IG51bGw7XG5cdFx0fVxuXHRcdHJldHVybiBuZXcgU2FuaXRpemF0aW9uKHNjaGVtYSwgY3VzdG9tKS5zYW5pdGl6ZShwb3N0LCBjYWxsYmFjayk7XG5cdH07XG5cblx0U2NoZW1hSW5zcGVjdG9yLnZhbGlkYXRlID0gZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlLCBjdXN0b20sIGNhbGxiYWNrKSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgJiYgdHlwZW9mIGN1c3RvbSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0Y2FsbGJhY2sgPSBjdXN0b207XG5cdFx0XHRjdXN0b20gPSBudWxsO1xuXHRcdH1cblx0XHRyZXR1cm4gbmV3IFZhbGlkYXRpb24oc2NoZW1hLCBjdXN0b20pLnZhbGlkYXRlKGNhbmRpZGF0ZSwgY2FsbGJhY2spO1xuXHR9O1xuXG5cdFNjaGVtYUluc3BlY3Rvci5nZW5lcmF0ZSA9IGZ1bmN0aW9uIChzY2hlbWEsIG4pIHtcblx0XHRpZiAodHlwZW9mIG4gPT09ICdudW1iZXInKSB7XG5cdFx0XHR2YXIgciA9IG5ldyBBcnJheShuKTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSB7XG5cdFx0XHRcdHJbaV0gPSBDYW5kaWRhdGVHZW5lcmF0b3IuaW5zdGFuY2UoKS5nZW5lcmF0ZShzY2hlbWEpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHI7XG5cdFx0fVxuXHRcdHJldHVybiBDYW5kaWRhdGVHZW5lcmF0b3IuaW5zdGFuY2UoKS5nZW5lcmF0ZShzY2hlbWEpO1xuXHR9O1xufSkoKTtcbiIsIihmdW5jdGlvbiAocHJvY2VzcyxnbG9iYWwpe1xuLyohXG4gKiBhc3luY1xuICogaHR0cHM6Ly9naXRodWIuY29tL2Nhb2xhbi9hc3luY1xuICpcbiAqIENvcHlyaWdodCAyMDEwLTIwMTQgQ2FvbGFuIE1jTWFob25cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICovXG4oZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGFzeW5jID0ge307XG4gICAgZnVuY3Rpb24gbm9vcCgpIHt9XG4gICAgZnVuY3Rpb24gaWRlbnRpdHkodikge1xuICAgICAgICByZXR1cm4gdjtcbiAgICB9XG4gICAgZnVuY3Rpb24gdG9Cb29sKHYpIHtcbiAgICAgICAgcmV0dXJuICEhdjtcbiAgICB9XG4gICAgZnVuY3Rpb24gbm90SWQodikge1xuICAgICAgICByZXR1cm4gIXY7XG4gICAgfVxuXG4gICAgLy8gZ2xvYmFsIG9uIHRoZSBzZXJ2ZXIsIHdpbmRvdyBpbiB0aGUgYnJvd3NlclxuICAgIHZhciBwcmV2aW91c19hc3luYztcblxuICAgIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIChgc2VsZmApIGluIHRoZSBicm93c2VyLCBgZ2xvYmFsYFxuICAgIC8vIG9uIHRoZSBzZXJ2ZXIsIG9yIGB0aGlzYCBpbiBzb21lIHZpcnR1YWwgbWFjaGluZXMuIFdlIHVzZSBgc2VsZmBcbiAgICAvLyBpbnN0ZWFkIG9mIGB3aW5kb3dgIGZvciBgV2ViV29ya2VyYCBzdXBwb3J0LlxuICAgIHZhciByb290ID0gdHlwZW9mIHNlbGYgPT09ICdvYmplY3QnICYmIHNlbGYuc2VsZiA9PT0gc2VsZiAmJiBzZWxmIHx8XG4gICAgICAgICAgICB0eXBlb2YgZ2xvYmFsID09PSAnb2JqZWN0JyAmJiBnbG9iYWwuZ2xvYmFsID09PSBnbG9iYWwgJiYgZ2xvYmFsIHx8XG4gICAgICAgICAgICB0aGlzO1xuXG4gICAgaWYgKHJvb3QgIT0gbnVsbCkge1xuICAgICAgICBwcmV2aW91c19hc3luYyA9IHJvb3QuYXN5bmM7XG4gICAgfVxuXG4gICAgYXN5bmMubm9Db25mbGljdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcm9vdC5hc3luYyA9IHByZXZpb3VzX2FzeW5jO1xuICAgICAgICByZXR1cm4gYXN5bmM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG9ubHlfb25jZShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZm4gPT09IG51bGwpIHRocm93IG5ldyBFcnJvcihcIkNhbGxiYWNrIHdhcyBhbHJlYWR5IGNhbGxlZC5cIik7XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgZm4gPSBudWxsO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9vbmNlKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmIChmbiA9PT0gbnVsbCkgcmV0dXJuO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vIGNyb3NzLWJyb3dzZXIgY29tcGF0aWJsaXR5IGZ1bmN0aW9ucyAvLy8vXG5cbiAgICB2YXIgX3RvU3RyaW5nID0gT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZztcblxuICAgIHZhciBfaXNBcnJheSA9IEFycmF5LmlzQXJyYXkgfHwgZnVuY3Rpb24gKG9iaikge1xuICAgICAgICByZXR1cm4gX3RvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICB9O1xuXG4gICAgLy8gUG9ydGVkIGZyb20gdW5kZXJzY29yZS5qcyBpc09iamVjdFxuICAgIHZhciBfaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICAgICAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2lzQXJyYXlMaWtlKGFycikge1xuICAgICAgICByZXR1cm4gX2lzQXJyYXkoYXJyKSB8fCAoXG4gICAgICAgICAgICAvLyBoYXMgYSBwb3NpdGl2ZSBpbnRlZ2VyIGxlbmd0aCBwcm9wZXJ0eVxuICAgICAgICAgICAgdHlwZW9mIGFyci5sZW5ndGggPT09IFwibnVtYmVyXCIgJiZcbiAgICAgICAgICAgIGFyci5sZW5ndGggPj0gMCAmJlxuICAgICAgICAgICAgYXJyLmxlbmd0aCAlIDEgPT09IDBcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXJyYXlFYWNoKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnIubGVuZ3RoO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICBpdGVyYXRvcihhcnJbaW5kZXhdLCBpbmRleCwgYXJyKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9tYXAoYXJyLCBpdGVyYXRvcikge1xuICAgICAgICB2YXIgaW5kZXggPSAtMSxcbiAgICAgICAgICAgIGxlbmd0aCA9IGFyci5sZW5ndGgsXG4gICAgICAgICAgICByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgICAgIHdoaWxlICgrK2luZGV4IDwgbGVuZ3RoKSB7XG4gICAgICAgICAgICByZXN1bHRbaW5kZXhdID0gaXRlcmF0b3IoYXJyW2luZGV4XSwgaW5kZXgsIGFycik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfcmFuZ2UoY291bnQpIHtcbiAgICAgICAgcmV0dXJuIF9tYXAoQXJyYXkoY291bnQpLCBmdW5jdGlvbiAodiwgaSkgeyByZXR1cm4gaTsgfSk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JlZHVjZShhcnIsIGl0ZXJhdG9yLCBtZW1vKSB7XG4gICAgICAgIF9hcnJheUVhY2goYXJyLCBmdW5jdGlvbiAoeCwgaSwgYSkge1xuICAgICAgICAgICAgbWVtbyA9IGl0ZXJhdG9yKG1lbW8sIHgsIGksIGEpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2ZvckVhY2hPZihvYmplY3QsIGl0ZXJhdG9yKSB7XG4gICAgICAgIF9hcnJheUVhY2goX2tleXMob2JqZWN0KSwgZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgaXRlcmF0b3Iob2JqZWN0W2tleV0sIGtleSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9pbmRleE9mKGFyciwgaXRlbSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKGFycltpXSA9PT0gaXRlbSkgcmV0dXJuIGk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cblxuICAgIHZhciBfa2V5cyA9IE9iamVjdC5rZXlzIHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgdmFyIGtleXMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgICAgICAgIGlmIChvYmouaGFzT3duUHJvcGVydHkoaykpIHtcbiAgICAgICAgICAgICAgICBrZXlzLnB1c2goayk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGtleXM7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9rZXlJdGVyYXRvcihjb2xsKSB7XG4gICAgICAgIHZhciBpID0gLTE7XG4gICAgICAgIHZhciBsZW47XG4gICAgICAgIHZhciBrZXlzO1xuICAgICAgICBpZiAoX2lzQXJyYXlMaWtlKGNvbGwpKSB7XG4gICAgICAgICAgICBsZW4gPSBjb2xsLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGkgOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGtleXMgPSBfa2V5cyhjb2xsKTtcbiAgICAgICAgICAgIGxlbiA9IGtleXMubGVuZ3RoO1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIG5leHQoKSB7XG4gICAgICAgICAgICAgICAgaSsrO1xuICAgICAgICAgICAgICAgIHJldHVybiBpIDwgbGVuID8ga2V5c1tpXSA6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2ltaWxhciB0byBFUzYncyByZXN0IHBhcmFtIChodHRwOi8vYXJpeWEub2ZpbGFicy5jb20vMjAxMy8wMy9lczYtYW5kLXJlc3QtcGFyYW1ldGVyLmh0bWwpXG4gICAgLy8gVGhpcyBhY2N1bXVsYXRlcyB0aGUgYXJndW1lbnRzIHBhc3NlZCBpbnRvIGFuIGFycmF5LCBhZnRlciBhIGdpdmVuIGluZGV4LlxuICAgIC8vIEZyb20gdW5kZXJzY29yZS5qcyAoaHR0cHM6Ly9naXRodWIuY29tL2phc2hrZW5hcy91bmRlcnNjb3JlL3B1bGwvMjE0MCkuXG4gICAgZnVuY3Rpb24gX3Jlc3RQYXJhbShmdW5jLCBzdGFydEluZGV4KSB7XG4gICAgICAgIHN0YXJ0SW5kZXggPSBzdGFydEluZGV4ID09IG51bGwgPyBmdW5jLmxlbmd0aCAtIDEgOiArc3RhcnRJbmRleDtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KGFyZ3VtZW50cy5sZW5ndGggLSBzdGFydEluZGV4LCAwKTtcbiAgICAgICAgICAgIHZhciByZXN0ID0gQXJyYXkobGVuZ3RoKTtcbiAgICAgICAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgICAgICByZXN0W2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleCArIHN0YXJ0SW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3dpdGNoIChzdGFydEluZGV4KSB7XG4gICAgICAgICAgICAgICAgY2FzZSAwOiByZXR1cm4gZnVuYy5jYWxsKHRoaXMsIHJlc3QpO1xuICAgICAgICAgICAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCBhcmd1bWVudHNbMF0sIHJlc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQ3VycmVudGx5IHVudXNlZCBidXQgaGFuZGxlIGNhc2VzIG91dHNpZGUgb2YgdGhlIHN3aXRjaCBzdGF0ZW1lbnQ6XG4gICAgICAgICAgICAvLyB2YXIgYXJncyA9IEFycmF5KHN0YXJ0SW5kZXggKyAxKTtcbiAgICAgICAgICAgIC8vIGZvciAoaW5kZXggPSAwOyBpbmRleCA8IHN0YXJ0SW5kZXg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIC8vICAgICBhcmdzW2luZGV4XSA9IGFyZ3VtZW50c1tpbmRleF07XG4gICAgICAgICAgICAvLyB9XG4gICAgICAgICAgICAvLyBhcmdzW3N0YXJ0SW5kZXhdID0gcmVzdDtcbiAgICAgICAgICAgIC8vIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlcmF0b3IodmFsdWUsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLy8vIGV4cG9ydGVkIGFzeW5jIG1vZHVsZSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgLy8vLyBuZXh0VGljayBpbXBsZW1lbnRhdGlvbiB3aXRoIGJyb3dzZXItY29tcGF0aWJsZSBmYWxsYmFjayAvLy8vXG5cbiAgICAvLyBjYXB0dXJlIHRoZSBnbG9iYWwgcmVmZXJlbmNlIHRvIGd1YXJkIGFnYWluc3QgZmFrZVRpbWVyIG1vY2tzXG4gICAgdmFyIF9zZXRJbW1lZGlhdGUgPSB0eXBlb2Ygc2V0SW1tZWRpYXRlID09PSAnZnVuY3Rpb24nICYmIHNldEltbWVkaWF0ZTtcblxuICAgIHZhciBfZGVsYXkgPSBfc2V0SW1tZWRpYXRlID8gZnVuY3Rpb24oZm4pIHtcbiAgICAgICAgLy8gbm90IGEgZGlyZWN0IGFsaWFzIGZvciBJRTEwIGNvbXBhdGliaWxpdHlcbiAgICAgICAgX3NldEltbWVkaWF0ZShmbik7XG4gICAgfSA6IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZm4sIDApO1xuICAgIH07XG5cbiAgICBpZiAodHlwZW9mIHByb2Nlc3MgPT09ICdvYmplY3QnICYmIHR5cGVvZiBwcm9jZXNzLm5leHRUaWNrID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGFzeW5jLm5leHRUaWNrID0gcHJvY2Vzcy5uZXh0VGljaztcbiAgICB9IGVsc2Uge1xuICAgICAgICBhc3luYy5uZXh0VGljayA9IF9kZWxheTtcbiAgICB9XG4gICAgYXN5bmMuc2V0SW1tZWRpYXRlID0gX3NldEltbWVkaWF0ZSA/IF9kZWxheSA6IGFzeW5jLm5leHRUaWNrO1xuXG5cbiAgICBhc3luYy5mb3JFYWNoID1cbiAgICBhc3luYy5lYWNoID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5lYWNoT2YoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoU2VyaWVzID1cbiAgICBhc3luYy5lYWNoU2VyaWVzID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5lYWNoT2ZTZXJpZXMoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cblxuICAgIGFzeW5jLmZvckVhY2hMaW1pdCA9XG4gICAgYXN5bmMuZWFjaExpbWl0ID0gZnVuY3Rpb24gKGFyciwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gX2VhY2hPZkxpbWl0KGxpbWl0KShhcnIsIF93aXRob3V0SW5kZXgoaXRlcmF0b3IpLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hPZiA9XG4gICAgYXN5bmMuZWFjaE9mID0gZnVuY3Rpb24gKG9iamVjdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIG9iamVjdCA9IG9iamVjdCB8fCBbXTtcblxuICAgICAgICB2YXIgaXRlciA9IF9rZXlJdGVyYXRvcihvYmplY3QpO1xuICAgICAgICB2YXIga2V5LCBjb21wbGV0ZWQgPSAwO1xuXG4gICAgICAgIHdoaWxlICgoa2V5ID0gaXRlcigpKSAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb21wbGV0ZWQgKz0gMTtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG9iamVjdFtrZXldLCBrZXksIG9ubHlfb25jZShkb25lKSk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoY29tcGxldGVkID09PSAwKSBjYWxsYmFjayhudWxsKTtcblxuICAgICAgICBmdW5jdGlvbiBkb25lKGVycikge1xuICAgICAgICAgICAgY29tcGxldGVkLS07XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIENoZWNrIGtleSBpcyBudWxsIGluIGNhc2UgaXRlcmF0b3IgaXNuJ3QgZXhoYXVzdGVkXG4gICAgICAgICAgICAvLyBhbmQgZG9uZSByZXNvbHZlZCBzeW5jaHJvbm91c2x5LlxuICAgICAgICAgICAgZWxzZSBpZiAoa2V5ID09PSBudWxsICYmIGNvbXBsZXRlZCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaE9mU2VyaWVzID1cbiAgICBhc3luYy5lYWNoT2ZTZXJpZXMgPSBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgb2JqID0gb2JqIHx8IFtdO1xuICAgICAgICB2YXIgbmV4dEtleSA9IF9rZXlJdGVyYXRvcihvYmopO1xuICAgICAgICB2YXIga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICBmdW5jdGlvbiBpdGVyYXRlKCkge1xuICAgICAgICAgICAgdmFyIHN5bmMgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGl0ZXJhdG9yKG9ialtrZXldLCBrZXksIG9ubHlfb25jZShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShpdGVyYXRlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlcmF0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGl0ZXJhdGUoKTtcbiAgICB9O1xuXG5cblxuICAgIGFzeW5jLmZvckVhY2hPZkxpbWl0ID1cbiAgICBhc3luYy5lYWNoT2ZMaW1pdCA9IGZ1bmN0aW9uIChvYmosIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgX2VhY2hPZkxpbWl0KGxpbWl0KShvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9lYWNoT2ZMaW1pdChsaW1pdCkge1xuXG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgICAgICBvYmogPSBvYmogfHwgW107XG4gICAgICAgICAgICB2YXIgbmV4dEtleSA9IF9rZXlJdGVyYXRvcihvYmopO1xuICAgICAgICAgICAgaWYgKGxpbWl0IDw9IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgZG9uZSA9IGZhbHNlO1xuICAgICAgICAgICAgdmFyIHJ1bm5pbmcgPSAwO1xuICAgICAgICAgICAgdmFyIGVycm9yZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgKGZ1bmN0aW9uIHJlcGxlbmlzaCAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGRvbmUgJiYgcnVubmluZyA8PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAocnVubmluZyA8IGxpbWl0ICYmICFlcnJvcmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBuZXh0S2V5KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3Iob2JqW2tleV0sIGtleSwgb25seV9vbmNlKGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJ1bm5pbmcgLT0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVycm9yZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVwbGVuaXNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSgpO1xuICAgICAgICB9O1xuICAgIH1cblxuXG4gICAgZnVuY3Rpb24gZG9QYXJhbGxlbChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4oYXN5bmMuZWFjaE9mLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWxMaW1pdChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKF9lYWNoT2ZMaW1pdChsaW1pdCksIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZnVuY3Rpb24gZG9TZXJpZXMoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGFzeW5jLmVhY2hPZlNlcmllcywgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9hc3luY01hcChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIGFyciA9IGFyciB8fCBbXTtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBfaXNBcnJheUxpa2UoYXJyKSA/IFtdIDoge307XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh2YWx1ZSwgaW5kZXgsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpdGVyYXRvcih2YWx1ZSwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIHJlc3VsdHNbaW5kZXhdID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLm1hcCA9IGRvUGFyYWxsZWwoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBTZXJpZXMgPSBkb1NlcmllcyhfYXN5bmNNYXApO1xuICAgIGFzeW5jLm1hcExpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9hc3luY01hcCk7XG5cbiAgICAvLyByZWR1Y2Ugb25seSBoYXMgYSBzZXJpZXMgdmVyc2lvbiwgYXMgZG9pbmcgcmVkdWNlIGluIHBhcmFsbGVsIHdvbid0XG4gICAgLy8gd29yayBpbiBtYW55IHNpdHVhdGlvbnMuXG4gICAgYXN5bmMuaW5qZWN0ID1cbiAgICBhc3luYy5mb2xkbCA9XG4gICAgYXN5bmMucmVkdWNlID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLmVhY2hPZlNlcmllcyhhcnIsIGZ1bmN0aW9uICh4LCBpLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IobWVtbywgeCwgZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIG1lbW8gPSB2O1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCBtZW1vKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLmZvbGRyID1cbiAgICBhc3luYy5yZWR1Y2VSaWdodCA9IGZ1bmN0aW9uIChhcnIsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmV2ZXJzZWQgPSBfbWFwKGFyciwgaWRlbnRpdHkpLnJldmVyc2UoKTtcbiAgICAgICAgYXN5bmMucmVkdWNlKHJldmVyc2VkLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy50cmFuc2Zvcm0gPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gaXRlcmF0b3I7XG4gICAgICAgICAgICBpdGVyYXRvciA9IG1lbW87XG4gICAgICAgICAgICBtZW1vID0gX2lzQXJyYXkoYXJyKSA/IFtdIDoge307XG4gICAgICAgIH1cblxuICAgICAgICBhc3luYy5lYWNoT2YoYXJyLCBmdW5jdGlvbih2LCBrLCBjYikge1xuICAgICAgICAgICAgaXRlcmF0b3IobWVtbywgdiwgaywgY2IpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbWVtbyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZmlsdGVyKGVhY2hmbiwgYXJyLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICAgICAgZWFjaGZuKGFyciwgZnVuY3Rpb24gKHgsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRzLnB1c2goe2luZGV4OiBpbmRleCwgdmFsdWU6IHh9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhfbWFwKHJlc3VsdHMuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgIHJldHVybiBhLmluZGV4IC0gYi5pbmRleDtcbiAgICAgICAgICAgIH0pLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5zZWxlY3QgPVxuICAgIGFzeW5jLmZpbHRlciA9IGRvUGFyYWxsZWwoX2ZpbHRlcik7XG5cbiAgICBhc3luYy5zZWxlY3RMaW1pdCA9XG4gICAgYXN5bmMuZmlsdGVyTGltaXQgPSBkb1BhcmFsbGVsTGltaXQoX2ZpbHRlcik7XG5cbiAgICBhc3luYy5zZWxlY3RTZXJpZXMgPVxuICAgIGFzeW5jLmZpbHRlclNlcmllcyA9IGRvU2VyaWVzKF9maWx0ZXIpO1xuXG4gICAgZnVuY3Rpb24gX3JlamVjdChlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9maWx0ZXIoZWFjaGZuLCBhcnIsIGZ1bmN0aW9uKHZhbHVlLCBjYikge1xuICAgICAgICAgICAgaXRlcmF0b3IodmFsdWUsIGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgICBjYighdik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgIH1cbiAgICBhc3luYy5yZWplY3QgPSBkb1BhcmFsbGVsKF9yZWplY3QpO1xuICAgIGFzeW5jLnJlamVjdExpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9yZWplY3QpO1xuICAgIGFzeW5jLnJlamVjdFNlcmllcyA9IGRvU2VyaWVzKF9yZWplY3QpO1xuXG4gICAgZnVuY3Rpb24gX2NyZWF0ZVRlc3RlcihlYWNoZm4sIGNoZWNrLCBnZXRSZXN1bHQpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKGFyciwgbGltaXQsIGl0ZXJhdG9yLCBjYikge1xuICAgICAgICAgICAgZnVuY3Rpb24gZG9uZSgpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2IpIGNiKGdldFJlc3VsdChmYWxzZSwgdm9pZCAwKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBpdGVyYXRlZSh4LCBfLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGlmICghY2IpIHJldHVybiBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYiAmJiBjaGVjayh2KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2IoZ2V0UmVzdWx0KHRydWUsIHgpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiID0gaXRlcmF0b3IgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjaygpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgZWFjaGZuKGFyciwgbGltaXQsIGl0ZXJhdGVlLCBkb25lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2IgPSBpdGVyYXRvcjtcbiAgICAgICAgICAgICAgICBpdGVyYXRvciA9IGxpbWl0O1xuICAgICAgICAgICAgICAgIGVhY2hmbihhcnIsIGl0ZXJhdGVlLCBkb25lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYy5hbnkgPVxuICAgIGFzeW5jLnNvbWUgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgdG9Cb29sLCBpZGVudGl0eSk7XG5cbiAgICBhc3luYy5zb21lTGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCB0b0Jvb2wsIGlkZW50aXR5KTtcblxuICAgIGFzeW5jLmFsbCA9XG4gICAgYXN5bmMuZXZlcnkgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZiwgbm90SWQsIG5vdElkKTtcblxuICAgIGFzeW5jLmV2ZXJ5TGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCBub3RJZCwgbm90SWQpO1xuXG4gICAgZnVuY3Rpb24gX2ZpbmRHZXRSZXN1bHQodiwgeCkge1xuICAgICAgICByZXR1cm4geDtcbiAgICB9XG4gICAgYXN5bmMuZGV0ZWN0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG4gICAgYXN5bmMuZGV0ZWN0U2VyaWVzID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZTZXJpZXMsIGlkZW50aXR5LCBfZmluZEdldFJlc3VsdCk7XG4gICAgYXN5bmMuZGV0ZWN0TGltaXQgPSBfY3JlYXRlVGVzdGVyKGFzeW5jLmVhY2hPZkxpbWl0LCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuXG4gICAgYXN5bmMuc29ydEJ5ID0gZnVuY3Rpb24gKGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGFzeW5jLm1hcChhcnIsIGZ1bmN0aW9uICh4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeCwgZnVuY3Rpb24gKGVyciwgY3JpdGVyaWEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB7dmFsdWU6IHgsIGNyaXRlcmlhOiBjcml0ZXJpYX0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyLCByZXN1bHRzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBfbWFwKHJlc3VsdHMuc29ydChjb21wYXJhdG9yKSwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHgudmFsdWU7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZ1bmN0aW9uIGNvbXBhcmF0b3IobGVmdCwgcmlnaHQpIHtcbiAgICAgICAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYSwgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgICAgICAgcmV0dXJuIGEgPCBiID8gLTEgOiBhID4gYiA/IDEgOiAwO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmF1dG8gPSBmdW5jdGlvbiAodGFza3MsIGNvbmN1cnJlbmN5LCBjYWxsYmFjaykge1xuICAgICAgICBpZiAodHlwZW9mIGFyZ3VtZW50c1sxXSA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgLy8gY29uY3VycmVuY3kgaXMgb3B0aW9uYWwsIHNoaWZ0IHRoZSBhcmdzLlxuICAgICAgICAgICAgY2FsbGJhY2sgPSBjb25jdXJyZW5jeTtcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICB2YXIga2V5cyA9IF9rZXlzKHRhc2tzKTtcbiAgICAgICAgdmFyIHJlbWFpbmluZ1Rhc2tzID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGlmICghcmVtYWluaW5nVGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IHJlbWFpbmluZ1Rhc2tzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgdmFyIHJ1bm5pbmdUYXNrcyA9IDA7XG5cbiAgICAgICAgdmFyIGhhc0Vycm9yID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIGxpc3RlbmVycyA9IFtdO1xuICAgICAgICBmdW5jdGlvbiBhZGRMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgbGlzdGVuZXJzLnVuc2hpZnQoZm4pO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIHJlbW92ZUxpc3RlbmVyKGZuKSB7XG4gICAgICAgICAgICB2YXIgaWR4ID0gX2luZGV4T2YobGlzdGVuZXJzLCBmbik7XG4gICAgICAgICAgICBpZiAoaWR4ID49IDApIGxpc3RlbmVycy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB0YXNrQ29tcGxldGUoKSB7XG4gICAgICAgICAgICByZW1haW5pbmdUYXNrcy0tO1xuICAgICAgICAgICAgX2FycmF5RWFjaChsaXN0ZW5lcnMuc2xpY2UoMCksIGZ1bmN0aW9uIChmbikge1xuICAgICAgICAgICAgICAgIGZuKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFkZExpc3RlbmVyKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmICghcmVtYWluaW5nVGFza3MpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgX2FycmF5RWFjaChrZXlzLCBmdW5jdGlvbiAoaykge1xuICAgICAgICAgICAgaWYgKGhhc0Vycm9yKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgdGFzayA9IF9pc0FycmF5KHRhc2tzW2tdKSA/IHRhc2tzW2tdOiBbdGFza3Nba11dO1xuICAgICAgICAgICAgdmFyIHRhc2tDYWxsYmFjayA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgcnVubmluZ1Rhc2tzLS07XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHNhZmVSZXN1bHRzID0ge307XG4gICAgICAgICAgICAgICAgICAgIF9mb3JFYWNoT2YocmVzdWx0cywgZnVuY3Rpb24odmFsLCBya2V5KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1tya2V5XSA9IHZhbDtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHNhZmVSZXN1bHRzW2tdID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgaGFzRXJyb3IgPSB0cnVlO1xuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgc2FmZVJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZSh0YXNrQ29tcGxldGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdmFyIHJlcXVpcmVzID0gdGFzay5zbGljZSgwLCB0YXNrLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgLy8gcHJldmVudCBkZWFkLWxvY2tzXG4gICAgICAgICAgICB2YXIgbGVuID0gcmVxdWlyZXMubGVuZ3RoO1xuICAgICAgICAgICAgdmFyIGRlcDtcbiAgICAgICAgICAgIHdoaWxlIChsZW4tLSkge1xuICAgICAgICAgICAgICAgIGlmICghKGRlcCA9IHRhc2tzW3JlcXVpcmVzW2xlbl1dKSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBub25leGlzdGVudCBkZXBlbmRlbmN5IGluICcgKyByZXF1aXJlcy5qb2luKCcsICcpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKF9pc0FycmF5KGRlcCkgJiYgX2luZGV4T2YoZGVwLCBrKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSGFzIGN5Y2xpYyBkZXBlbmRlbmNpZXMnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiByZWFkeSgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcnVubmluZ1Rhc2tzIDwgY29uY3VycmVuY3kgJiYgX3JlZHVjZShyZXF1aXJlcywgZnVuY3Rpb24gKGEsIHgpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChhICYmIHJlc3VsdHMuaGFzT3duUHJvcGVydHkoeCkpO1xuICAgICAgICAgICAgICAgIH0sIHRydWUpICYmICFyZXN1bHRzLmhhc093blByb3BlcnR5KGspO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHJlYWR5KCkpIHtcbiAgICAgICAgICAgICAgICBydW5uaW5nVGFza3MrKztcbiAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGFkZExpc3RlbmVyKGxpc3RlbmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZ1bmN0aW9uIGxpc3RlbmVyKCkge1xuICAgICAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJ1bm5pbmdUYXNrcysrO1xuICAgICAgICAgICAgICAgICAgICByZW1vdmVMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICAgICAgICAgIHRhc2tbdGFzay5sZW5ndGggLSAxXSh0YXNrQ2FsbGJhY2ssIHJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuXG5cbiAgICBhc3luYy5yZXRyeSA9IGZ1bmN0aW9uKHRpbWVzLCB0YXNrLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgREVGQVVMVF9USU1FUyA9IDU7XG4gICAgICAgIHZhciBERUZBVUxUX0lOVEVSVkFMID0gMDtcblxuICAgICAgICB2YXIgYXR0ZW1wdHMgPSBbXTtcblxuICAgICAgICB2YXIgb3B0cyA9IHtcbiAgICAgICAgICAgIHRpbWVzOiBERUZBVUxUX1RJTUVTLFxuICAgICAgICAgICAgaW50ZXJ2YWw6IERFRkFVTFRfSU5URVJWQUxcbiAgICAgICAgfTtcblxuICAgICAgICBmdW5jdGlvbiBwYXJzZVRpbWVzKGFjYywgdCl7XG4gICAgICAgICAgICBpZih0eXBlb2YgdCA9PT0gJ251bWJlcicpe1xuICAgICAgICAgICAgICAgIGFjYy50aW1lcyA9IHBhcnNlSW50KHQsIDEwKSB8fCBERUZBVUxUX1RJTUVTO1xuICAgICAgICAgICAgfSBlbHNlIGlmKHR5cGVvZiB0ID09PSAnb2JqZWN0Jyl7XG4gICAgICAgICAgICAgICAgYWNjLnRpbWVzID0gcGFyc2VJbnQodC50aW1lcywgMTApIHx8IERFRkFVTFRfVElNRVM7XG4gICAgICAgICAgICAgICAgYWNjLmludGVydmFsID0gcGFyc2VJbnQodC5pbnRlcnZhbCwgMTApIHx8IERFRkFVTFRfSU5URVJWQUw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgYXJndW1lbnQgdHlwZSBmb3IgXFwndGltZXNcXCc6ICcgKyB0eXBlb2YgdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgaWYgKGxlbmd0aCA8IDEgfHwgbGVuZ3RoID4gMykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIGFyZ3VtZW50cyAtIG11c3QgYmUgZWl0aGVyICh0YXNrKSwgKHRhc2ssIGNhbGxiYWNrKSwgKHRpbWVzLCB0YXNrKSBvciAodGltZXMsIHRhc2ssIGNhbGxiYWNrKScpO1xuICAgICAgICB9IGVsc2UgaWYgKGxlbmd0aCA8PSAyICYmIHR5cGVvZiB0aW1lcyA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgY2FsbGJhY2sgPSB0YXNrO1xuICAgICAgICAgICAgdGFzayA9IHRpbWVzO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0eXBlb2YgdGltZXMgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHBhcnNlVGltZXMob3B0cywgdGltZXMpO1xuICAgICAgICB9XG4gICAgICAgIG9wdHMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICAgICAgb3B0cy50YXNrID0gdGFzaztcblxuICAgICAgICBmdW5jdGlvbiB3cmFwcGVkVGFzayh3cmFwcGVkQ2FsbGJhY2ssIHdyYXBwZWRSZXN1bHRzKSB7XG4gICAgICAgICAgICBmdW5jdGlvbiByZXRyeUF0dGVtcHQodGFzaywgZmluYWxBdHRlbXB0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHNlcmllc0NhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRhc2soZnVuY3Rpb24oZXJyLCByZXN1bHQpe1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VyaWVzQ2FsbGJhY2soIWVyciB8fCBmaW5hbEF0dGVtcHQsIHtlcnI6IGVyciwgcmVzdWx0OiByZXN1bHR9KTtcbiAgICAgICAgICAgICAgICAgICAgfSwgd3JhcHBlZFJlc3VsdHMpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIHJldHJ5SW50ZXJ2YWwoaW50ZXJ2YWwpe1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpZXNDYWxsYmFjayl7XG4gICAgICAgICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc0NhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9LCBpbnRlcnZhbCk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgd2hpbGUgKG9wdHMudGltZXMpIHtcblxuICAgICAgICAgICAgICAgIHZhciBmaW5hbEF0dGVtcHQgPSAhKG9wdHMudGltZXMtPTEpO1xuICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlBdHRlbXB0KG9wdHMudGFzaywgZmluYWxBdHRlbXB0KSk7XG4gICAgICAgICAgICAgICAgaWYoIWZpbmFsQXR0ZW1wdCAmJiBvcHRzLmludGVydmFsID4gMCl7XG4gICAgICAgICAgICAgICAgICAgIGF0dGVtcHRzLnB1c2gocmV0cnlJbnRlcnZhbChvcHRzLmludGVydmFsKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3luYy5zZXJpZXMoYXR0ZW1wdHMsIGZ1bmN0aW9uKGRvbmUsIGRhdGEpe1xuICAgICAgICAgICAgICAgIGRhdGEgPSBkYXRhW2RhdGEubGVuZ3RoIC0gMV07XG4gICAgICAgICAgICAgICAgKHdyYXBwZWRDYWxsYmFjayB8fCBvcHRzLmNhbGxiYWNrKShkYXRhLmVyciwgZGF0YS5yZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiBhIGNhbGxiYWNrIGlzIHBhc3NlZCwgcnVuIHRoaXMgYXMgYSBjb250cm9sbCBmbG93XG4gICAgICAgIHJldHVybiBvcHRzLmNhbGxiYWNrID8gd3JhcHBlZFRhc2soKSA6IHdyYXBwZWRUYXNrO1xuICAgIH07XG5cbiAgICBhc3luYy53YXRlcmZhbGwgPSBmdW5jdGlvbiAodGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIGlmICghX2lzQXJyYXkodGFza3MpKSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gbmV3IEVycm9yKCdGaXJzdCBhcmd1bWVudCB0byB3YXRlcmZhbGwgbXVzdCBiZSBhbiBhcnJheSBvZiBmdW5jdGlvbnMnKTtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGFza3MubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiB3cmFwSXRlcmF0b3IoaXRlcmF0b3IpIHtcbiAgICAgICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIFtlcnJdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbmV4dCA9IGl0ZXJhdG9yLm5leHQoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG5leHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaCh3cmFwSXRlcmF0b3IobmV4dCkpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncy5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbnN1cmVBc3luYyhpdGVyYXRvcikuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgd3JhcEl0ZXJhdG9yKGFzeW5jLml0ZXJhdG9yKHRhc2tzKSkoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX3BhcmFsbGVsKGVhY2hmbiwgdGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSBfaXNBcnJheUxpa2UodGFza3MpID8gW10gOiB7fTtcblxuICAgICAgICBlYWNoZm4odGFza3MsIGZ1bmN0aW9uICh0YXNrLCBrZXksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0YXNrKF9yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXN1bHRzW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGFzeW5jLnBhcmFsbGVsID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoYXN5bmMuZWFjaE9mLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5wYXJhbGxlbExpbWl0ID0gZnVuY3Rpb24odGFza3MsIGxpbWl0LCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoX2VhY2hPZkxpbWl0KGxpbWl0KSwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuc2VyaWVzID0gZnVuY3Rpb24odGFza3MsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9wYXJhbGxlbChhc3luYy5lYWNoT2ZTZXJpZXMsIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLml0ZXJhdG9yID0gZnVuY3Rpb24gKHRhc2tzKSB7XG4gICAgICAgIGZ1bmN0aW9uIG1ha2VDYWxsYmFjayhpbmRleCkge1xuICAgICAgICAgICAgZnVuY3Rpb24gZm4oKSB7XG4gICAgICAgICAgICAgICAgaWYgKHRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICB0YXNrc1tpbmRleF0uYXBwbHkobnVsbCwgYXJndW1lbnRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZuLm5leHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGZuLm5leHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIChpbmRleCA8IHRhc2tzLmxlbmd0aCAtIDEpID8gbWFrZUNhbGxiYWNrKGluZGV4ICsgMSk6IG51bGw7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIGZuO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYWtlQ2FsbGJhY2soMCk7XG4gICAgfTtcblxuICAgIGFzeW5jLmFwcGx5ID0gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGNhbGxBcmdzKSB7XG4gICAgICAgICAgICByZXR1cm4gZm4uYXBwbHkoXG4gICAgICAgICAgICAgICAgbnVsbCwgYXJncy5jb25jYXQoY2FsbEFyZ3MpXG4gICAgICAgICAgICApO1xuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGZ1bmN0aW9uIF9jb25jYXQoZWFjaGZuLCBhcnIsIGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2IpIHtcbiAgICAgICAgICAgIGZuKHgsIGZ1bmN0aW9uIChlcnIsIHkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSByZXN1bHQuY29uY2F0KHkgfHwgW10pO1xuICAgICAgICAgICAgICAgIGNiKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyLCByZXN1bHQpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMuY29uY2F0ID0gZG9QYXJhbGxlbChfY29uY2F0KTtcbiAgICBhc3luYy5jb25jYXRTZXJpZXMgPSBkb1NlcmllcyhfY29uY2F0KTtcblxuICAgIGFzeW5jLndoaWxzdCA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuICAgICAgICBpZiAodGVzdCgpKSB7XG4gICAgICAgICAgICB2YXIgbmV4dCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGVzdC5hcHBseSh0aGlzLCBhcmdzKSkge1xuICAgICAgICAgICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBbbnVsbF0uY29uY2F0KGFyZ3MpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgYXN5bmMuZG9XaGlsc3QgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxscyA9IDA7XG4gICAgICAgIHJldHVybiBhc3luYy53aGlsc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gKytjYWxscyA8PSAxIHx8IHRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMudW50aWwgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy53aGlsc3QoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9VbnRpbCA9IGZ1bmN0aW9uIChpdGVyYXRvciwgdGVzdCwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLmRvV2hpbHN0KGl0ZXJhdG9yLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmR1cmluZyA9IGZ1bmN0aW9uICh0ZXN0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBub29wO1xuXG4gICAgICAgIHZhciBuZXh0ID0gX3Jlc3RQYXJhbShmdW5jdGlvbihlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcmdzLnB1c2goY2hlY2spO1xuICAgICAgICAgICAgICAgIHRlc3QuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHZhciBjaGVjayA9IGZ1bmN0aW9uKGVyciwgdHJ1dGgpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0cnV0aCkge1xuICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG5leHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0ZXN0KGNoZWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZG9EdXJpbmcgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciBjYWxscyA9IDA7XG4gICAgICAgIGFzeW5jLmR1cmluZyhmdW5jdGlvbihuZXh0KSB7XG4gICAgICAgICAgICBpZiAoY2FsbHMrKyA8IDEpIHtcbiAgICAgICAgICAgICAgICBuZXh0KG51bGwsIHRydWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5LCBwYXlsb2FkKSB7XG4gICAgICAgIGlmIChjb25jdXJyZW5jeSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZihjb25jdXJyZW5jeSA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDb25jdXJyZW5jeSBtdXN0IG5vdCBiZSB6ZXJvJyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwb3MsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcInRhc2sgY2FsbGJhY2sgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcS5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghX2lzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgICAgICBkYXRhID0gW2RhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYoZGF0YS5sZW5ndGggPT09IDAgJiYgcS5pZGxlKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBjYWxsIGRyYWluIGltbWVkaWF0ZWx5IGlmIHRoZXJlIGFyZSBubyB0YXNrc1xuICAgICAgICAgICAgICAgIHJldHVybiBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHEuZHJhaW4oKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF9hcnJheUVhY2goZGF0YSwgZnVuY3Rpb24odGFzaykge1xuICAgICAgICAgICAgICAgIHZhciBpdGVtID0ge1xuICAgICAgICAgICAgICAgICAgICBkYXRhOiB0YXNrLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogY2FsbGJhY2sgfHwgbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBpZiAocG9zKSB7XG4gICAgICAgICAgICAgICAgICAgIHEudGFza3MudW5zaGlmdChpdGVtKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSBxLmNvbmN1cnJlbmN5KSB7XG4gICAgICAgICAgICAgICAgICAgIHEuc2F0dXJhdGVkKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBfbmV4dChxLCB0YXNrcykge1xuICAgICAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgd29ya2VycyAtPSAxO1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlbW92ZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKHRhc2tzLCBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICBfYXJyYXlFYWNoKHdvcmtlcnNMaXN0LCBmdW5jdGlvbiAod29ya2VyLCBpbmRleCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHdvcmtlciA9PT0gdGFzayAmJiAhcmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtlcnNMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHRhc2suY2FsbGJhY2suYXBwbHkodGFzaywgYXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHEucHJvY2VzcygpO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3b3JrZXJzID0gMDtcbiAgICAgICAgdmFyIHdvcmtlcnNMaXN0ID0gW107XG4gICAgICAgIHZhciBxID0ge1xuICAgICAgICAgICAgdGFza3M6IFtdLFxuICAgICAgICAgICAgY29uY3VycmVuY3k6IGNvbmN1cnJlbmN5LFxuICAgICAgICAgICAgcGF5bG9hZDogcGF5bG9hZCxcbiAgICAgICAgICAgIHNhdHVyYXRlZDogbm9vcCxcbiAgICAgICAgICAgIGVtcHR5OiBub29wLFxuICAgICAgICAgICAgZHJhaW46IG5vb3AsXG4gICAgICAgICAgICBzdGFydGVkOiBmYWxzZSxcbiAgICAgICAgICAgIHBhdXNlZDogZmFsc2UsXG4gICAgICAgICAgICBwdXNoOiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIGZhbHNlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAga2lsbDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHEuZHJhaW4gPSBub29wO1xuICAgICAgICAgICAgICAgIHEudGFza3MgPSBbXTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB1bnNoaWZ0OiBmdW5jdGlvbiAoZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHRydWUsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgd2hpbGUoIXEucGF1c2VkICYmIHdvcmtlcnMgPCBxLmNvbmN1cnJlbmN5ICYmIHEudGFza3MubGVuZ3RoKXtcblxuICAgICAgICAgICAgICAgICAgICB2YXIgdGFza3MgPSBxLnBheWxvYWQgP1xuICAgICAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoMCwgcS5wYXlsb2FkKSA6XG4gICAgICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZSgwLCBxLnRhc2tzLmxlbmd0aCk7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSBfbWFwKHRhc2tzLCBmdW5jdGlvbiAodGFzaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhc2suZGF0YTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHEudGFza3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxLmVtcHR5KCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgd29ya2VycyArPSAxO1xuICAgICAgICAgICAgICAgICAgICB3b3JrZXJzTGlzdC5wdXNoKHRhc2tzWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNiID0gb25seV9vbmNlKF9uZXh0KHEsIHRhc2tzKSk7XG4gICAgICAgICAgICAgICAgICAgIHdvcmtlcihkYXRhLCBjYik7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxlbmd0aDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLnRhc2tzLmxlbmd0aDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBydW5uaW5nOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlcnM7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgd29ya2Vyc0xpc3Q6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2Vyc0xpc3Q7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaWRsZTogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHEudGFza3MubGVuZ3RoICsgd29ya2VycyA9PT0gMDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXVzZTogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHEucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZXN1bWU6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBpZiAocS5wYXVzZWQgPT09IGZhbHNlKSB7IHJldHVybjsgfVxuICAgICAgICAgICAgICAgIHEucGF1c2VkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIHJlc3VtZUNvdW50ID0gTWF0aC5taW4ocS5jb25jdXJyZW5jeSwgcS50YXNrcy5sZW5ndGgpO1xuICAgICAgICAgICAgICAgIC8vIE5lZWQgdG8gY2FsbCBxLnByb2Nlc3Mgb25jZSBwZXIgY29uY3VycmVudFxuICAgICAgICAgICAgICAgIC8vIHdvcmtlciB0byBwcmVzZXJ2ZSBmdWxsIGNvbmN1cnJlbmN5IGFmdGVyIHBhdXNlXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgdyA9IDE7IHcgPD0gcmVzdW1lQ291bnQ7IHcrKykge1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiBxO1xuICAgIH1cblxuICAgIGFzeW5jLnF1ZXVlID0gZnVuY3Rpb24gKHdvcmtlciwgY29uY3VycmVuY3kpIHtcbiAgICAgICAgdmFyIHEgPSBfcXVldWUoZnVuY3Rpb24gKGl0ZW1zLCBjYikge1xuICAgICAgICAgICAgd29ya2VyKGl0ZW1zWzBdLCBjYik7XG4gICAgICAgIH0sIGNvbmN1cnJlbmN5LCAxKTtcblxuICAgICAgICByZXR1cm4gcTtcbiAgICB9O1xuXG4gICAgYXN5bmMucHJpb3JpdHlRdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG5cbiAgICAgICAgZnVuY3Rpb24gX2NvbXBhcmVUYXNrcyhhLCBiKXtcbiAgICAgICAgICAgIHJldHVybiBhLnByaW9yaXR5IC0gYi5wcmlvcml0eTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIF9iaW5hcnlTZWFyY2goc2VxdWVuY2UsIGl0ZW0sIGNvbXBhcmUpIHtcbiAgICAgICAgICAgIHZhciBiZWcgPSAtMSxcbiAgICAgICAgICAgICAgICBlbmQgPSBzZXF1ZW5jZS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgd2hpbGUgKGJlZyA8IGVuZCkge1xuICAgICAgICAgICAgICAgIHZhciBtaWQgPSBiZWcgKyAoKGVuZCAtIGJlZyArIDEpID4+PiAxKTtcbiAgICAgICAgICAgICAgICBpZiAoY29tcGFyZShpdGVtLCBzZXF1ZW5jZVttaWRdKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgIGJlZyA9IG1pZDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBlbmQgPSBtaWQgLSAxO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBiZWc7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIV9pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGRhdGEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGRhdGEsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgcHJpb3JpdHk6IHByaW9yaXR5LFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjazogdHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nID8gY2FsbGJhY2sgOiBub29wXG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKF9iaW5hcnlTZWFyY2gocS50YXNrcywgaXRlbSwgX2NvbXBhcmVUYXNrcykgKyAxLCAwLCBpdGVtKTtcblxuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUocS5wcm9jZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RhcnQgd2l0aCBhIG5vcm1hbCBxdWV1ZVxuICAgICAgICB2YXIgcSA9IGFzeW5jLnF1ZXVlKHdvcmtlciwgY29uY3VycmVuY3kpO1xuXG4gICAgICAgIC8vIE92ZXJyaWRlIHB1c2ggdG8gYWNjZXB0IHNlY29uZCBwYXJhbWV0ZXIgcmVwcmVzZW50aW5nIHByaW9yaXR5XG4gICAgICAgIHEucHVzaCA9IGZ1bmN0aW9uIChkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIF9pbnNlcnQocSwgZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBSZW1vdmUgdW5zaGlmdCBmdW5jdGlvblxuICAgICAgICBkZWxldGUgcS51bnNoaWZ0O1xuXG4gICAgICAgIHJldHVybiBxO1xuICAgIH07XG5cbiAgICBhc3luYy5jYXJnbyA9IGZ1bmN0aW9uICh3b3JrZXIsIHBheWxvYWQpIHtcbiAgICAgICAgcmV0dXJuIF9xdWV1ZSh3b3JrZXIsIDEsIHBheWxvYWQpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfY29uc29sZV9mbihuYW1lKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChmbiwgYXJncykge1xuICAgICAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY29uc29sZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbnNvbGUuZXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoY29uc29sZVtuYW1lXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgX2FycmF5RWFjaChhcmdzLCBmdW5jdGlvbiAoeCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGVbbmFtZV0oeCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYXN5bmMubG9nID0gX2NvbnNvbGVfZm4oJ2xvZycpO1xuICAgIGFzeW5jLmRpciA9IF9jb25zb2xlX2ZuKCdkaXInKTtcbiAgICAvKmFzeW5jLmluZm8gPSBfY29uc29sZV9mbignaW5mbycpO1xuICAgIGFzeW5jLndhcm4gPSBfY29uc29sZV9mbignd2FybicpO1xuICAgIGFzeW5jLmVycm9yID0gX2NvbnNvbGVfZm4oJ2Vycm9yJyk7Ki9cblxuICAgIGFzeW5jLm1lbW9pemUgPSBmdW5jdGlvbiAoZm4sIGhhc2hlcikge1xuICAgICAgICB2YXIgbWVtbyA9IHt9O1xuICAgICAgICB2YXIgcXVldWVzID0ge307XG4gICAgICAgIHZhciBoYXMgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuICAgICAgICBoYXNoZXIgPSBoYXNoZXIgfHwgaWRlbnRpdHk7XG4gICAgICAgIHZhciBtZW1vaXplZCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gbWVtb2l6ZWQoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIHZhciBrZXkgPSBoYXNoZXIuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICBpZiAoaGFzLmNhbGwobWVtbywga2V5KSkgeyAgIFxuICAgICAgICAgICAgICAgIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIG1lbW9ba2V5XSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChoYXMuY2FsbChxdWV1ZXMsIGtleSkpIHtcbiAgICAgICAgICAgICAgICBxdWV1ZXNba2V5XS5wdXNoKGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHF1ZXVlc1trZXldID0gW2NhbGxiYWNrXTtcbiAgICAgICAgICAgICAgICBmbi5hcHBseShudWxsLCBhcmdzLmNvbmNhdChbX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgICAgICAgICBtZW1vW2tleV0gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcSA9IHF1ZXVlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBkZWxldGUgcXVldWVzW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwLCBsID0gcS5sZW5ndGg7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHFbaV0uYXBwbHkobnVsbCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIG1lbW9pemVkLm1lbW8gPSBtZW1vO1xuICAgICAgICBtZW1vaXplZC51bm1lbW9pemVkID0gZm47XG4gICAgICAgIHJldHVybiBtZW1vaXplZDtcbiAgICB9O1xuXG4gICAgYXN5bmMudW5tZW1vaXplID0gZnVuY3Rpb24gKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gKGZuLnVubWVtb2l6ZWQgfHwgZm4pLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgIH07XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF90aW1lcyhtYXBwZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjb3VudCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBtYXBwZXIoX3JhbmdlKGNvdW50KSwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBhc3luYy50aW1lcyA9IF90aW1lcyhhc3luYy5tYXApO1xuICAgIGFzeW5jLnRpbWVzU2VyaWVzID0gX3RpbWVzKGFzeW5jLm1hcFNlcmllcyk7XG4gICAgYXN5bmMudGltZXNMaW1pdCA9IGZ1bmN0aW9uIChjb3VudCwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMubWFwTGltaXQoX3JhbmdlKGNvdW50KSwgbGltaXQsIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnNlcSA9IGZ1bmN0aW9uICgvKiBmdW5jdGlvbnMuLi4gKi8pIHtcbiAgICAgICAgdmFyIGZucyA9IGFyZ3VtZW50cztcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcblxuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJnc1thcmdzLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgYXJncy5wb3AoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBub29wO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBhc3luYy5yZWR1Y2UoZm5zLCBhcmdzLCBmdW5jdGlvbiAobmV3YXJncywgZm4sIGNiKSB7XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkodGhhdCwgbmV3YXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGVyciwgbmV4dGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgY2IoZXJyLCBuZXh0YXJncyk7XG4gICAgICAgICAgICAgICAgfSldKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHRoYXQsIFtlcnJdLmNvbmNhdChyZXN1bHRzKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIGFzeW5jLmNvbXBvc2UgPSBmdW5jdGlvbiAoLyogZnVuY3Rpb25zLi4uICovKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5zZXEuYXBwbHkobnVsbCwgQXJyYXkucHJvdG90eXBlLnJldmVyc2UuY2FsbChhcmd1bWVudHMpKTtcbiAgICB9O1xuXG5cbiAgICBmdW5jdGlvbiBfYXBwbHlFYWNoKGVhY2hmbikge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbihmbnMsIGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBnbyA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oYXJncykge1xuICAgICAgICAgICAgICAgIHZhciB0aGF0ID0gdGhpcztcbiAgICAgICAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBhcmdzLnBvcCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBlYWNoZm4oZm5zLCBmdW5jdGlvbiAoZm4sIF8sIGNiKSB7XG4gICAgICAgICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIGFyZ3MuY29uY2F0KFtjYl0pKTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdvLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGdvO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5hcHBseUVhY2ggPSBfYXBwbHlFYWNoKGFzeW5jLmVhY2hPZik7XG4gICAgYXN5bmMuYXBwbHlFYWNoU2VyaWVzID0gX2FwcGx5RWFjaChhc3luYy5lYWNoT2ZTZXJpZXMpO1xuXG5cbiAgICBhc3luYy5mb3JldmVyID0gZnVuY3Rpb24gKGZuLCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgZG9uZSA9IG9ubHlfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIHRhc2sgPSBlbnN1cmVBc3luYyhmbik7XG4gICAgICAgIGZ1bmN0aW9uIG5leHQoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRvbmUoZXJyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhc2sobmV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgbmV4dCgpO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBlbnN1cmVBc3luYyhmbikge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIGFyZ3MucHVzaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlubmVyQXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICBpZiAoc3luYykge1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgaW5uZXJBcmdzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgc3luYyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5lbnN1cmVBc3luYyA9IGVuc3VyZUFzeW5jO1xuXG4gICAgYXN5bmMuY29uc3RhbnQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKHZhbHVlcykge1xuICAgICAgICB2YXIgYXJncyA9IFtudWxsXS5jb25jYXQodmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXN5bmMud3JhcFN5bmMgPVxuICAgIGFzeW5jLmFzeW5jaWZ5ID0gZnVuY3Rpb24gYXN5bmNpZnkoZnVuYykge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoYXJncykge1xuICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgIHZhciByZXN1bHQ7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gaWYgcmVzdWx0IGlzIFByb21pc2Ugb2JqZWN0XG4gICAgICAgICAgICBpZiAoX2lzT2JqZWN0KHJlc3VsdCkgJiYgdHlwZW9mIHJlc3VsdC50aGVuID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQudGhlbihmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCB2YWx1ZSk7XG4gICAgICAgICAgICAgICAgfSlbXCJjYXRjaFwiXShmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLm1lc3NhZ2UgPyBlcnIgOiBuZXcgRXJyb3IoZXJyKSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHJlc3VsdCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBOb2RlLmpzXG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgPT09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICAgIG1vZHVsZS5leHBvcnRzID0gYXN5bmM7XG4gICAgfVxuICAgIC8vIEFNRCAvIFJlcXVpcmVKU1xuICAgIGVsc2UgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgICAgICBkZWZpbmUoW10sIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBhc3luYztcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8vIGluY2x1ZGVkIGRpcmVjdGx5IHZpYSA8c2NyaXB0PiB0YWdcbiAgICBlbHNlIHtcbiAgICAgICAgcm9vdC5hc3luYyA9IGFzeW5jO1xuICAgIH1cblxufSgpKTtcblxufSkuY2FsbCh0aGlzLHJlcXVpcmUoJ19wcm9jZXNzJyksdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbCA6IHR5cGVvZiBzZWxmICE9PSBcInVuZGVmaW5lZFwiID8gc2VsZiA6IHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cgOiB7fSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltNXZaR1ZmYlc5a2RXeGxjeTl6WTJobGJXRXRhVzV6Y0dWamRHOXlMMjV2WkdWZmJXOWtkV3hsY3k5aGMzbHVZeTlzYVdJdllYTjVibU11YW5NaVhTd2libUZ0WlhNaU9sdGRMQ0p0WVhCd2FXNW5jeUk2SWp0QlFVRkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFTSXNJbVpwYkdVaU9pSm5aVzVsY21GMFpXUXVhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjME52Ym5SbGJuUWlPbHNpTHlvaFhHNGdLaUJoYzNsdVkxeHVJQ29nYUhSMGNITTZMeTluYVhSb2RXSXVZMjl0TDJOaGIyeGhiaTloYzNsdVkxeHVJQ3BjYmlBcUlFTnZjSGx5YVdkb2RDQXlNREV3TFRJd01UUWdRMkZ2YkdGdUlFMWpUV0ZvYjI1Y2JpQXFJRkpsYkdWaGMyVmtJSFZ1WkdWeUlIUm9aU0JOU1ZRZ2JHbGpaVzV6WlZ4dUlDb3ZYRzRvWm5WdVkzUnBiMjRnS0NrZ2UxeHVYRzRnSUNBZ2RtRnlJR0Z6ZVc1aklEMGdlMzA3WEc0Z0lDQWdablZ1WTNScGIyNGdibTl2Y0NncElIdDlYRzRnSUNBZ1puVnVZM1JwYjI0Z2FXUmxiblJwZEhrb2Rpa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdkanRjYmlBZ0lDQjlYRzRnSUNBZ1puVnVZM1JwYjI0Z2RHOUNiMjlzS0hZcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlDRWhkanRjYmlBZ0lDQjlYRzRnSUNBZ1puVnVZM1JwYjI0Z2JtOTBTV1FvZGlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z0lYWTdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ0x5OGdaMnh2WW1Gc0lHOXVJSFJvWlNCelpYSjJaWElzSUhkcGJtUnZkeUJwYmlCMGFHVWdZbkp2ZDNObGNseHVJQ0FnSUhaaGNpQndjbVYyYVc5MWMxOWhjM2x1WXp0Y2JseHVJQ0FnSUM4dklFVnpkR0ZpYkdsemFDQjBhR1VnY205dmRDQnZZbXBsWTNRc0lHQjNhVzVrYjNkZ0lDaGdjMlZzWm1BcElHbHVJSFJvWlNCaWNtOTNjMlZ5TENCZ1oyeHZZbUZzWUZ4dUlDQWdJQzh2SUc5dUlIUm9aU0J6WlhKMlpYSXNJRzl5SUdCMGFHbHpZQ0JwYmlCemIyMWxJSFpwY25SMVlXd2diV0ZqYUdsdVpYTXVJRmRsSUhWelpTQmdjMlZzWm1CY2JpQWdJQ0F2THlCcGJuTjBaV0ZrSUc5bUlHQjNhVzVrYjNkZ0lHWnZjaUJnVjJWaVYyOXlhMlZ5WUNCemRYQndiM0owTGx4dUlDQWdJSFpoY2lCeWIyOTBJRDBnZEhsd1pXOW1JSE5sYkdZZ1BUMDlJQ2R2WW1wbFkzUW5JQ1ltSUhObGJHWXVjMlZzWmlBOVBUMGdjMlZzWmlBbUppQnpaV3htSUh4OFhHNGdJQ0FnSUNBZ0lDQWdJQ0IwZVhCbGIyWWdaMnh2WW1Gc0lEMDlQU0FuYjJKcVpXTjBKeUFtSmlCbmJHOWlZV3d1WjJ4dlltRnNJRDA5UFNCbmJHOWlZV3dnSmlZZ1oyeHZZbUZzSUh4OFhHNGdJQ0FnSUNBZ0lDQWdJQ0IwYUdsek8xeHVYRzRnSUNBZ2FXWWdLSEp2YjNRZ0lUMGdiblZzYkNrZ2UxeHVJQ0FnSUNBZ0lDQndjbVYyYVc5MWMxOWhjM2x1WXlBOUlISnZiM1F1WVhONWJtTTdYRzRnSUNBZ2ZWeHVYRzRnSUNBZ1lYTjVibU11Ym05RGIyNW1iR2xqZENBOUlHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQWdJQ0FnY205dmRDNWhjM2x1WXlBOUlIQnlaWFpwYjNWelgyRnplVzVqTzF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWVhONWJtTTdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHWjFibU4wYVc5dUlHOXViSGxmYjI1alpTaG1iaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWm5WdVkzUnBiMjRvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1ptNGdQVDA5SUc1MWJHd3BJSFJvY205M0lHNWxkeUJGY25KdmNpaGNJa05oYkd4aVlXTnJJSGRoY3lCaGJISmxZV1I1SUdOaGJHeGxaQzVjSWlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JtYmk1aGNIQnNlU2gwYUdsekxDQmhjbWQxYldWdWRITXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ1ptNGdQU0J1ZFd4c08xeHVJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOXZibU5sS0dadUtTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2htYmlBOVBUMGdiblZzYkNrZ2NtVjBkWEp1TzF4dUlDQWdJQ0FnSUNBZ0lDQWdabTR1WVhCd2JIa29kR2hwY3l3Z1lYSm5kVzFsYm5SektUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdadUlEMGdiblZzYkR0Y2JpQWdJQ0FnSUNBZ2ZUdGNiaUFnSUNCOVhHNWNiaUFnSUNBdkx5OHZJR055YjNOekxXSnliM2R6WlhJZ1kyOXRjR0YwYVdKc2FYUjVJR1oxYm1OMGFXOXVjeUF2THk4dlhHNWNiaUFnSUNCMllYSWdYM1J2VTNSeWFXNW5JRDBnVDJKcVpXTjBMbkJ5YjNSdmRIbHdaUzUwYjFOMGNtbHVaenRjYmx4dUlDQWdJSFpoY2lCZmFYTkJjbkpoZVNBOUlFRnljbUY1TG1selFYSnlZWGtnZkh3Z1puVnVZM1JwYjI0Z0tHOWlhaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWDNSdlUzUnlhVzVuTG1OaGJHd29iMkpxS1NBOVBUMGdKMXR2WW1wbFkzUWdRWEp5WVhsZEp6dGNiaUFnSUNCOU8xeHVYRzRnSUNBZ0x5OGdVRzl5ZEdWa0lHWnliMjBnZFc1a1pYSnpZMjl5WlM1cWN5QnBjMDlpYW1WamRGeHVJQ0FnSUhaaGNpQmZhWE5QWW1wbFkzUWdQU0JtZFc1amRHbHZiaWh2WW1vcElIdGNiaUFnSUNBZ0lDQWdkbUZ5SUhSNWNHVWdQU0IwZVhCbGIyWWdiMkpxTzF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnZEhsd1pTQTlQVDBnSjJaMWJtTjBhVzl1SnlCOGZDQjBlWEJsSUQwOVBTQW5iMkpxWldOMEp5QW1KaUFoSVc5aWFqdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gybHpRWEp5WVhsTWFXdGxLR0Z5Y2lrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1gybHpRWEp5WVhrb1lYSnlLU0I4ZkNBb1hHNGdJQ0FnSUNBZ0lDQWdJQ0F2THlCb1lYTWdZU0J3YjNOcGRHbDJaU0JwYm5SbFoyVnlJR3hsYm1kMGFDQndjbTl3WlhKMGVWeHVJQ0FnSUNBZ0lDQWdJQ0FnZEhsd1pXOW1JR0Z5Y2k1c1pXNW5kR2dnUFQwOUlGd2liblZ0WW1WeVhDSWdKaVpjYmlBZ0lDQWdJQ0FnSUNBZ0lHRnljaTVzWlc1bmRHZ2dQajBnTUNBbUpseHVJQ0FnSUNBZ0lDQWdJQ0FnWVhKeUxteGxibWQwYUNBbElERWdQVDA5SURCY2JpQWdJQ0FnSUNBZ0tUdGNiaUFnSUNCOVhHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZllYSnlZWGxGWVdOb0tHRnljaXdnYVhSbGNtRjBiM0lwSUh0Y2JpQWdJQ0FnSUNBZ2RtRnlJR2x1WkdWNElEMGdMVEVzWEc0Z0lDQWdJQ0FnSUNBZ0lDQnNaVzVuZEdnZ1BTQmhjbkl1YkdWdVozUm9PMXh1WEc0Z0lDQWdJQ0FnSUhkb2FXeGxJQ2dySzJsdVpHVjRJRHdnYkdWdVozUm9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBkR1Z5WVhSdmNpaGhjbkpiYVc1a1pYaGRMQ0JwYm1SbGVDd2dZWEp5S1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUgxY2JseHVJQ0FnSUdaMWJtTjBhVzl1SUY5dFlYQW9ZWEp5TENCcGRHVnlZWFJ2Y2lrZ2UxeHVJQ0FnSUNBZ0lDQjJZWElnYVc1a1pYZ2dQU0F0TVN4Y2JpQWdJQ0FnSUNBZ0lDQWdJR3hsYm1kMGFDQTlJR0Z5Y2k1c1pXNW5kR2dzWEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWE4xYkhRZ1BTQkJjbkpoZVNoc1pXNW5kR2dwTzF4dVhHNGdJQ0FnSUNBZ0lIZG9hV3hsSUNncksybHVaR1Y0SUR3Z2JHVnVaM1JvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMWJIUmJhVzVrWlhoZElEMGdhWFJsY21GMGIzSW9ZWEp5VzJsdVpHVjRYU3dnYVc1a1pYZ3NJR0Z5Y2lrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlISmxjM1ZzZER0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JtZFc1amRHbHZiaUJmY21GdVoyVW9ZMjkxYm5RcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlGOXRZWEFvUVhKeVlYa29ZMjkxYm5RcExDQm1kVzVqZEdsdmJpQW9kaXdnYVNrZ2V5QnlaWFIxY200Z2FUc2dmU2s3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdablZ1WTNScGIyNGdYM0psWkhWalpTaGhjbklzSUdsMFpYSmhkRzl5TENCdFpXMXZLU0I3WEc0Z0lDQWdJQ0FnSUY5aGNuSmhlVVZoWTJnb1lYSnlMQ0JtZFc1amRHbHZiaUFvZUN3Z2FTd2dZU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdiV1Z0YnlBOUlHbDBaWEpoZEc5eUtHMWxiVzhzSUhnc0lHa3NJR0VwTzF4dUlDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHMWxiVzg3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdablZ1WTNScGIyNGdYMlp2Y2tWaFkyaFBaaWh2WW1wbFkzUXNJR2wwWlhKaGRHOXlLU0I3WEc0Z0lDQWdJQ0FnSUY5aGNuSmhlVVZoWTJnb1gydGxlWE1vYjJKcVpXTjBLU3dnWm5WdVkzUnBiMjRnS0d0bGVTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FYUmxjbUYwYjNJb2IySnFaV04wVzJ0bGVWMHNJR3RsZVNrN1hHNGdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOXBibVJsZUU5bUtHRnljaXdnYVhSbGJTa2dlMXh1SUNBZ0lDQWdJQ0JtYjNJZ0tIWmhjaUJwSUQwZ01Ec2dhU0E4SUdGeWNpNXNaVzVuZEdnN0lHa3JLeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dGeWNsdHBYU0E5UFQwZ2FYUmxiU2tnY21WMGRYSnVJR2s3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUMweE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUhaaGNpQmZhMlY1Y3lBOUlFOWlhbVZqZEM1clpYbHpJSHg4SUdaMWJtTjBhVzl1SUNodlltb3BJSHRjYmlBZ0lDQWdJQ0FnZG1GeUlHdGxlWE1nUFNCYlhUdGNiaUFnSUNBZ0lDQWdabTl5SUNoMllYSWdheUJwYmlCdlltb3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2h2WW1vdWFHRnpUM2R1VUhKdmNHVnlkSGtvYXlrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnJaWGx6TG5CMWMyZ29heWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR3RsZVhNN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdaMWJtTjBhVzl1SUY5clpYbEpkR1Z5WVhSdmNpaGpiMnhzS1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJwSUQwZ0xURTdYRzRnSUNBZ0lDQWdJSFpoY2lCc1pXNDdYRzRnSUNBZ0lDQWdJSFpoY2lCclpYbHpPMXh1SUNBZ0lDQWdJQ0JwWmlBb1gybHpRWEp5WVhsTWFXdGxLR052Ykd3cEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCc1pXNGdQU0JqYjJ4c0xteGxibWQwYUR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpQnVaWGgwS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHa3JLenRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdhU0E4SUd4bGJpQS9JR2tnT2lCdWRXeHNPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZUdGNiaUFnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUd0bGVYTWdQU0JmYTJWNWN5aGpiMnhzS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJR3hsYmlBOUlHdGxlWE11YkdWdVozUm9PMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1SUc1bGVIUW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVNzck8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCcElEd2diR1Z1SUQ4Z2EyVjVjMXRwWFNBNklHNTFiR3c3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdmVnh1WEc0Z0lDQWdMeThnVTJsdGFXeGhjaUIwYnlCRlV6WW5jeUJ5WlhOMElIQmhjbUZ0SUNob2RIUndPaTh2WVhKcGVXRXViMlpwYkdGaWN5NWpiMjB2TWpBeE15OHdNeTlsY3pZdFlXNWtMWEpsYzNRdGNHRnlZVzFsZEdWeUxtaDBiV3dwWEc0Z0lDQWdMeThnVkdocGN5QmhZMk4xYlhWc1lYUmxjeUIwYUdVZ1lYSm5kVzFsYm5SeklIQmhjM05sWkNCcGJuUnZJR0Z1SUdGeWNtRjVMQ0JoWm5SbGNpQmhJR2RwZG1WdUlHbHVaR1Y0TGx4dUlDQWdJQzh2SUVaeWIyMGdkVzVrWlhKelkyOXlaUzVxY3lBb2FIUjBjSE02THk5bmFYUm9kV0l1WTI5dEwycGhjMmhyWlc1aGN5OTFibVJsY25OamIzSmxMM0IxYkd3dk1qRTBNQ2t1WEc0Z0lDQWdablZ1WTNScGIyNGdYM0psYzNSUVlYSmhiU2htZFc1akxDQnpkR0Z5ZEVsdVpHVjRLU0I3WEc0Z0lDQWdJQ0FnSUhOMFlYSjBTVzVrWlhnZ1BTQnpkR0Z5ZEVsdVpHVjRJRDA5SUc1MWJHd2dQeUJtZFc1akxteGxibWQwYUNBdElERWdPaUFyYzNSaGNuUkpibVJsZUR0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1S0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHeGxibWQwYUNBOUlFMWhkR2d1YldGNEtHRnlaM1Z0Wlc1MGN5NXNaVzVuZEdnZ0xTQnpkR0Z5ZEVsdVpHVjRMQ0F3S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCeVpYTjBJRDBnUVhKeVlYa29iR1Z1WjNSb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdadmNpQW9kbUZ5SUdsdVpHVjRJRDBnTURzZ2FXNWtaWGdnUENCc1pXNW5kR2c3SUdsdVpHVjRLeXNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYTjBXMmx1WkdWNFhTQTlJR0Z5WjNWdFpXNTBjMXRwYm1SbGVDQXJJSE4wWVhKMFNXNWtaWGhkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2MzZHBkR05vSUNoemRHRnlkRWx1WkdWNEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZ6WlNBd09pQnlaWFIxY200Z1puVnVZeTVqWVd4c0tIUm9hWE1zSUhKbGMzUXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYzJVZ01Ub2djbVYwZFhKdUlHWjFibU11WTJGc2JDaDBhR2x6TENCaGNtZDFiV1Z1ZEhOYk1GMHNJSEpsYzNRcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdMeThnUTNWeWNtVnVkR3g1SUhWdWRYTmxaQ0JpZFhRZ2FHRnVaR3hsSUdOaGMyVnpJRzkxZEhOcFpHVWdiMllnZEdobElITjNhWFJqYUNCemRHRjBaVzFsYm5RNlhHNGdJQ0FnSUNBZ0lDQWdJQ0F2THlCMllYSWdZWEpuY3lBOUlFRnljbUY1S0hOMFlYSjBTVzVrWlhnZ0t5QXhLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDOHZJR1p2Y2lBb2FXNWtaWGdnUFNBd095QnBibVJsZUNBOElITjBZWEowU1c1a1pYZzdJR2x1WkdWNEt5c3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDOHZJQ0FnSUNCaGNtZHpXMmx1WkdWNFhTQTlJR0Z5WjNWdFpXNTBjMXRwYm1SbGVGMDdYRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5QjlYRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5QmhjbWR6VzNOMFlYSjBTVzVrWlhoZElEMGdjbVZ6ZER0Y2JpQWdJQ0FnSUNBZ0lDQWdJQzh2SUhKbGRIVnliaUJtZFc1akxtRndjR3g1S0hSb2FYTXNJR0Z5WjNNcE8xeHVJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOTNhWFJvYjNWMFNXNWtaWGdvYVhSbGNtRjBiM0lwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1SUNoMllXeDFaU3dnYVc1a1pYZ3NJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2FYUmxjbUYwYjNJb2RtRnNkV1VzSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0FnSUNBZ2ZUdGNiaUFnSUNCOVhHNWNiaUFnSUNBdkx5OHZJR1Y0Y0c5eWRHVmtJR0Z6ZVc1aklHMXZaSFZzWlNCbWRXNWpkR2x2Ym5NZ0x5OHZMMXh1WEc0Z0lDQWdMeTh2THlCdVpYaDBWR2xqYXlCcGJYQnNaVzFsYm5SaGRHbHZiaUIzYVhSb0lHSnliM2R6WlhJdFkyOXRjR0YwYVdKc1pTQm1ZV3hzWW1GamF5QXZMeTh2WEc1Y2JpQWdJQ0F2THlCallYQjBkWEpsSUhSb1pTQm5iRzlpWVd3Z2NtVm1aWEpsYm1ObElIUnZJR2QxWVhKa0lHRm5ZV2x1YzNRZ1ptRnJaVlJwYldWeUlHMXZZMnR6WEc0Z0lDQWdkbUZ5SUY5elpYUkpiVzFsWkdsaGRHVWdQU0IwZVhCbGIyWWdjMlYwU1cxdFpXUnBZWFJsSUQwOVBTQW5ablZ1WTNScGIyNG5JQ1ltSUhObGRFbHRiV1ZrYVdGMFpUdGNibHh1SUNBZ0lIWmhjaUJmWkdWc1lYa2dQU0JmYzJWMFNXMXRaV1JwWVhSbElEOGdablZ1WTNScGIyNG9abTRwSUh0Y2JpQWdJQ0FnSUNBZ0x5OGdibTkwSUdFZ1pHbHlaV04wSUdGc2FXRnpJR1p2Y2lCSlJURXdJR052YlhCaGRHbGlhV3hwZEhsY2JpQWdJQ0FnSUNBZ1gzTmxkRWx0YldWa2FXRjBaU2htYmlrN1hHNGdJQ0FnZlNBNklHWjFibU4wYVc5dUtHWnVLU0I3WEc0Z0lDQWdJQ0FnSUhObGRGUnBiV1Z2ZFhRb1ptNHNJREFwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JwWmlBb2RIbHdaVzltSUhCeWIyTmxjM01nUFQwOUlDZHZZbXBsWTNRbklDWW1JSFI1Y0dWdlppQndjbTlqWlhOekxtNWxlSFJVYVdOcklEMDlQU0FuWm5WdVkzUnBiMjRuS1NCN1hHNGdJQ0FnSUNBZ0lHRnplVzVqTG01bGVIUlVhV05ySUQwZ2NISnZZMlZ6Y3k1dVpYaDBWR2xqYXp0Y2JpQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0JoYzNsdVl5NXVaWGgwVkdsamF5QTlJRjlrWld4aGVUdGNiaUFnSUNCOVhHNGdJQ0FnWVhONWJtTXVjMlYwU1cxdFpXUnBZWFJsSUQwZ1gzTmxkRWx0YldWa2FXRjBaU0EvSUY5a1pXeGhlU0E2SUdGemVXNWpMbTVsZUhSVWFXTnJPMXh1WEc1Y2JpQWdJQ0JoYzNsdVl5NW1iM0pGWVdOb0lEMWNiaUFnSUNCaGMzbHVZeTVsWVdOb0lEMGdablZ1WTNScGIyNGdLR0Z5Y2l3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQmhjM2x1WXk1bFlXTm9UMllvWVhKeUxDQmZkMmwwYUc5MWRFbHVaR1Y0S0dsMFpYSmhkRzl5S1N3Z1kyRnNiR0poWTJzcE8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNCaGMzbHVZeTVtYjNKRllXTm9VMlZ5YVdWeklEMWNiaUFnSUNCaGMzbHVZeTVsWVdOb1UyVnlhV1Z6SUQwZ1puVnVZM1JwYjI0Z0tHRnljaXdnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZeTVsWVdOb1QyWlRaWEpwWlhNb1lYSnlMQ0JmZDJsMGFHOTFkRWx1WkdWNEtHbDBaWEpoZEc5eUtTd2dZMkZzYkdKaFkyc3BPMXh1SUNBZ0lIMDdYRzVjYmx4dUlDQWdJR0Z6ZVc1akxtWnZja1ZoWTJoTWFXMXBkQ0E5WEc0Z0lDQWdZWE41Ym1NdVpXRmphRXhwYldsMElEMGdablZ1WTNScGIyNGdLR0Z5Y2l3Z2JHbHRhWFFzSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1gyVmhZMmhQWmt4cGJXbDBLR3hwYldsMEtTaGhjbklzSUY5M2FYUm9iM1YwU1c1a1pYZ29hWFJsY21GMGIzSXBMQ0JqWVd4c1ltRmpheWs3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR0Z6ZVc1akxtWnZja1ZoWTJoUFppQTlYRzRnSUNBZ1lYTjVibU11WldGamFFOW1JRDBnWm5WdVkzUnBiMjRnS0c5aWFtVmpkQ3dnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lHTmhiR3hpWVdOcklEMGdYMjl1WTJVb1kyRnNiR0poWTJzZ2ZId2dibTl2Y0NrN1hHNGdJQ0FnSUNBZ0lHOWlhbVZqZENBOUlHOWlhbVZqZENCOGZDQmJYVHRjYmx4dUlDQWdJQ0FnSUNCMllYSWdhWFJsY2lBOUlGOXJaWGxKZEdWeVlYUnZjaWh2WW1wbFkzUXBPMXh1SUNBZ0lDQWdJQ0IyWVhJZ2EyVjVMQ0JqYjIxd2JHVjBaV1FnUFNBd08xeHVYRzRnSUNBZ0lDQWdJSGRvYVd4bElDZ29hMlY1SUQwZ2FYUmxjaWdwS1NBaFBTQnVkV3hzS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqYjIxd2JHVjBaV1FnS3owZ01UdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsMFpYSmhkRzl5S0c5aWFtVmpkRnRyWlhsZExDQnJaWGtzSUc5dWJIbGZiMjVqWlNoa2IyNWxLU2s3WEc0Z0lDQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ0lDQnBaaUFvWTI5dGNHeGxkR1ZrSUQwOVBTQXdLU0JqWVd4c1ltRmpheWh1ZFd4c0tUdGNibHh1SUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJrYjI1bEtHVnljaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl0Y0d4bGRHVmtMUzA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc29aWEp5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lDOHZJRU5vWldOcklHdGxlU0JwY3lCdWRXeHNJR2x1SUdOaGMyVWdhWFJsY21GMGIzSWdhWE51SjNRZ1pYaG9ZWFZ6ZEdWa1hHNGdJQ0FnSUNBZ0lDQWdJQ0F2THlCaGJtUWdaRzl1WlNCeVpYTnZiSFpsWkNCemVXNWphSEp2Ym05MWMyeDVMbHh1SUNBZ0lDQWdJQ0FnSUNBZ1pXeHpaU0JwWmlBb2EyVjVJRDA5UFNCdWRXeHNJQ1ltSUdOdmJYQnNaWFJsWkNBOFBTQXdLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvYm5Wc2JDazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11Wm05eVJXRmphRTltVTJWeWFXVnpJRDFjYmlBZ0lDQmhjM2x1WXk1bFlXTm9UMlpUWlhKcFpYTWdQU0JtZFc1amRHbHZiaUFvYjJKcUxDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNnUFNCZmIyNWpaU2hqWVd4c1ltRmpheUI4ZkNCdWIyOXdLVHRjYmlBZ0lDQWdJQ0FnYjJKcUlEMGdiMkpxSUh4OElGdGRPMXh1SUNBZ0lDQWdJQ0IyWVhJZ2JtVjRkRXRsZVNBOUlGOXJaWGxKZEdWeVlYUnZjaWh2WW1vcE8xeHVJQ0FnSUNBZ0lDQjJZWElnYTJWNUlEMGdibVY0ZEV0bGVTZ3BPMXh1SUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJwZEdWeVlYUmxLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUhONWJtTWdQU0IwY25WbE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHdGxlU0E5UFQwZ2JuVnNiQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJqWVd4c1ltRmpheWh1ZFd4c0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJR2wwWlhKaGRHOXlLRzlpYWx0clpYbGRMQ0JyWlhrc0lHOXViSGxmYjI1alpTaG1kVzVqZEdsdmJpQW9aWEp5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR1Z5Y2lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWhsY25JcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhMlY1SUQwZ2JtVjRkRXRsZVNncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2EyVjVJRDA5UFNCdWRXeHNLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdZMkZzYkdKaFkyc29iblZzYkNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYzNsdVl5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGemVXNWpMbk5sZEVsdGJXVmthV0YwWlNocGRHVnlZWFJsS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FYUmxjbUYwWlNncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdmU2twTzF4dUlDQWdJQ0FnSUNBZ0lDQWdjM2x1WXlBOUlHWmhiSE5sTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lHbDBaWEpoZEdVb0tUdGNiaUFnSUNCOU8xeHVYRzVjYmx4dUlDQWdJR0Z6ZVc1akxtWnZja1ZoWTJoUFpreHBiV2wwSUQxY2JpQWdJQ0JoYzNsdVl5NWxZV05vVDJaTWFXMXBkQ0E5SUdaMWJtTjBhVzl1SUNodlltb3NJR3hwYldsMExDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnWDJWaFkyaFBaa3hwYldsMEtHeHBiV2wwS1Nodlltb3NJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWs3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjlsWVdOb1QyWk1hVzFwZENoc2FXMXBkQ2tnZTF4dVhHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlBb2IySnFMQ0JwZEdWeVlYUnZjaXdnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJJRDBnWDI5dVkyVW9ZMkZzYkdKaFkyc2dmSHdnYm05dmNDazdYRzRnSUNBZ0lDQWdJQ0FnSUNCdlltb2dQU0J2WW1vZ2ZId2dXMTA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnYm1WNGRFdGxlU0E5SUY5clpYbEpkR1Z5WVhSdmNpaHZZbW9wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0d4cGJXbDBJRHc5SURBcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z1kyRnNiR0poWTJzb2JuVnNiQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCMllYSWdaRzl1WlNBOUlHWmhiSE5sTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUhKMWJtNXBibWNnUFNBd08xeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHVnljbTl5WldRZ1BTQm1ZV3h6WlR0Y2JseHVJQ0FnSUNBZ0lDQWdJQ0FnS0daMWJtTjBhVzl1SUhKbGNHeGxibWx6YUNBb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dSdmJtVWdKaVlnY25WdWJtbHVaeUE4UFNBd0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJqWVd4c1ltRmpheWh1ZFd4c0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IzYUdsc1pTQW9jblZ1Ym1sdVp5QThJR3hwYldsMElDWW1JQ0ZsY25KdmNtVmtLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJyWlhrZ1BTQnVaWGgwUzJWNUtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaHJaWGtnUFQwOUlHNTFiR3dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdSdmJtVWdQU0IwY25WbE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSEoxYm01cGJtY2dQRDBnTUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLRzUxYkd3cE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1TzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKMWJtNXBibWNnS3owZ01UdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVhSbGNtRjBiM0lvYjJKcVcydGxlVjBzSUd0bGVTd2diMjVzZVY5dmJtTmxLR1oxYm1OMGFXOXVJQ2hsY25JcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISjFibTVwYm1jZ0xUMGdNVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlobGNuSXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdWeWNtOXlaV1FnUFNCMGNuVmxPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVZ3YkdWdWFYTm9LQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLU2dwTzF4dUlDQWdJQ0FnSUNCOU8xeHVJQ0FnSUgxY2JseHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1pHOVFZWEpoYkd4bGJDaG1iaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWm5WdVkzUnBiMjRnS0c5aWFpd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z1ptNG9ZWE41Ym1NdVpXRmphRTltTENCdlltb3NJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWs3WEc0Z0lDQWdJQ0FnSUgwN1hHNGdJQ0FnZlZ4dUlDQWdJR1oxYm1OMGFXOXVJR1J2VUdGeVlXeHNaV3hNYVcxcGRDaG1iaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWm5WdVkzUnBiMjRnS0c5aWFpd2diR2x0YVhRc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdadUtGOWxZV05vVDJaTWFXMXBkQ2hzYVcxcGRDa3NJRzlpYWl3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktUdGNiaUFnSUNBZ0lDQWdmVHRjYmlBZ0lDQjlYRzRnSUNBZ1puVnVZM1JwYjI0Z1pHOVRaWEpwWlhNb1ptNHBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJQ2h2WW1vc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdadUtHRnplVzVqTG1WaFkyaFBabE5sY21sbGN5d2diMkpxTENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcE8xeHVJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOWhjM2x1WTAxaGNDaGxZV05vWm00c0lHRnljaXdnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lHTmhiR3hpWVdOcklEMGdYMjl1WTJVb1kyRnNiR0poWTJzZ2ZId2dibTl2Y0NrN1hHNGdJQ0FnSUNBZ0lHRnljaUE5SUdGeWNpQjhmQ0JiWFR0Y2JpQWdJQ0FnSUNBZ2RtRnlJSEpsYzNWc2RITWdQU0JmYVhOQmNuSmhlVXhwYTJVb1lYSnlLU0EvSUZ0ZElEb2dlMzA3WEc0Z0lDQWdJQ0FnSUdWaFkyaG1iaWhoY25Jc0lHWjFibU4wYVc5dUlDaDJZV3gxWlN3Z2FXNWtaWGdzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwZEdWeVlYUnZjaWgyWVd4MVpTd2dablZ1WTNScGIyNGdLR1Z5Y2l3Z2Rpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsYzNWc2RITmJhVzVrWlhoZElEMGdkanRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWhsY25JcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lIMHNJR1oxYm1OMGFXOXVJQ2hsY25JcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0dWeWNpd2djbVZ6ZFd4MGN5azdYRzRnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJSDFjYmx4dUlDQWdJR0Z6ZVc1akxtMWhjQ0E5SUdSdlVHRnlZV3hzWld3b1gyRnplVzVqVFdGd0tUdGNiaUFnSUNCaGMzbHVZeTV0WVhCVFpYSnBaWE1nUFNCa2IxTmxjbWxsY3loZllYTjVibU5OWVhBcE8xeHVJQ0FnSUdGemVXNWpMbTFoY0V4cGJXbDBJRDBnWkc5UVlYSmhiR3hsYkV4cGJXbDBLRjloYzNsdVkwMWhjQ2s3WEc1Y2JpQWdJQ0F2THlCeVpXUjFZMlVnYjI1c2VTQm9ZWE1nWVNCelpYSnBaWE1nZG1WeWMybHZiaXdnWVhNZ1pHOXBibWNnY21Wa2RXTmxJR2x1SUhCaGNtRnNiR1ZzSUhkdmJpZDBYRzRnSUNBZ0x5OGdkMjl5YXlCcGJpQnRZVzU1SUhOcGRIVmhkR2x2Ym5NdVhHNGdJQ0FnWVhONWJtTXVhVzVxWldOMElEMWNiaUFnSUNCaGMzbHVZeTVtYjJ4a2JDQTlYRzRnSUNBZ1lYTjVibU11Y21Wa2RXTmxJRDBnWm5WdVkzUnBiMjRnS0dGeWNpd2diV1Z0Ynl3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJR0Z6ZVc1akxtVmhZMmhQWmxObGNtbGxjeWhoY25Jc0lHWjFibU4wYVc5dUlDaDRMQ0JwTENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVhSbGNtRjBiM0lvYldWdGJ5d2dlQ3dnWm5WdVkzUnBiMjRnS0dWeWNpd2dkaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUcxbGJXOGdQU0IyTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0dWeWNpazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdmU3dnWm5WdVkzUnBiMjRnS0dWeWNpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzb1pYSnlMQ0J0WlcxdktUdGNiaUFnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR0Z6ZVc1akxtWnZiR1J5SUQxY2JpQWdJQ0JoYzNsdVl5NXlaV1IxWTJWU2FXZG9kQ0E5SUdaMWJtTjBhVzl1SUNoaGNuSXNJRzFsYlc4c0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ2NtVjJaWEp6WldRZ1BTQmZiV0Z3S0dGeWNpd2dhV1JsYm5ScGRIa3BMbkpsZG1WeWMyVW9LVHRjYmlBZ0lDQWdJQ0FnWVhONWJtTXVjbVZrZFdObEtISmxkbVZ5YzJWa0xDQnRaVzF2TENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcE8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNCaGMzbHVZeTUwY21GdWMyWnZjbTBnUFNCbWRXNWpkR2x2YmlBb1lYSnlMQ0J0WlcxdkxDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnYVdZZ0tHRnlaM1Z0Wlc1MGN5NXNaVzVuZEdnZ1BUMDlJRE1wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJJRDBnYVhSbGNtRjBiM0k3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBkR1Z5WVhSdmNpQTlJRzFsYlc4N1hHNGdJQ0FnSUNBZ0lDQWdJQ0J0WlcxdklEMGdYMmx6UVhKeVlYa29ZWEp5S1NBL0lGdGRJRG9nZTMwN1hHNGdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0JoYzNsdVl5NWxZV05vVDJZb1lYSnlMQ0JtZFc1amRHbHZiaWgyTENCckxDQmpZaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhWFJsY21GMGIzSW9iV1Z0Ynl3Z2Rpd2dheXdnWTJJcE8xeHVJQ0FnSUNBZ0lDQjlMQ0JtZFc1amRHbHZiaWhsY25JcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0dWeWNpd2diV1Z0YnlrN1hHNGdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmZabWxzZEdWeUtHVmhZMmhtYml3Z1lYSnlMQ0JwZEdWeVlYUnZjaXdnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ2RtRnlJSEpsYzNWc2RITWdQU0JiWFR0Y2JpQWdJQ0FnSUNBZ1pXRmphR1p1S0dGeWNpd2dablZ1WTNScGIyNGdLSGdzSUdsdVpHVjRMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhWFJsY21GMGIzSW9lQ3dnWm5WdVkzUnBiMjRnS0hZcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvZGlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMWJIUnpMbkIxYzJnb2UybHVaR1Y0T2lCcGJtUmxlQ3dnZG1Gc2RXVTZJSGg5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUNBZ0lDQjlMQ0JtZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWhmYldGd0tISmxjM1ZzZEhNdWMyOXlkQ2htZFc1amRHbHZiaUFvWVN3Z1lpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmhMbWx1WkdWNElDMGdZaTVwYm1SbGVEdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwcExDQm1kVzVqZEdsdmJpQW9lQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUI0TG5aaGJIVmxPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTa3BPMXh1SUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JoYzNsdVl5NXpaV3hsWTNRZ1BWeHVJQ0FnSUdGemVXNWpMbVpwYkhSbGNpQTlJR1J2VUdGeVlXeHNaV3dvWDJacGJIUmxjaWs3WEc1Y2JpQWdJQ0JoYzNsdVl5NXpaV3hsWTNSTWFXMXBkQ0E5WEc0Z0lDQWdZWE41Ym1NdVptbHNkR1Z5VEdsdGFYUWdQU0JrYjFCaGNtRnNiR1ZzVEdsdGFYUW9YMlpwYkhSbGNpazdYRzVjYmlBZ0lDQmhjM2x1WXk1elpXeGxZM1JUWlhKcFpYTWdQVnh1SUNBZ0lHRnplVzVqTG1acGJIUmxjbE5sY21sbGN5QTlJR1J2VTJWeWFXVnpLRjltYVd4MFpYSXBPMXh1WEc0Z0lDQWdablZ1WTNScGIyNGdYM0psYW1WamRDaGxZV05vWm00c0lHRnljaXdnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lGOW1hV3gwWlhJb1pXRmphR1p1TENCaGNuSXNJR1oxYm1OMGFXOXVLSFpoYkhWbExDQmpZaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhWFJsY21GMGIzSW9kbUZzZFdVc0lHWjFibU4wYVc5dUtIWXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWWlnaGRpazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdmU3dnWTJGc2JHSmhZMnNwTzF4dUlDQWdJSDFjYmlBZ0lDQmhjM2x1WXk1eVpXcGxZM1FnUFNCa2IxQmhjbUZzYkdWc0tGOXlaV3BsWTNRcE8xeHVJQ0FnSUdGemVXNWpMbkpsYW1WamRFeHBiV2wwSUQwZ1pHOVFZWEpoYkd4bGJFeHBiV2wwS0Y5eVpXcGxZM1FwTzF4dUlDQWdJR0Z6ZVc1akxuSmxhbVZqZEZObGNtbGxjeUE5SUdSdlUyVnlhV1Z6S0Y5eVpXcGxZM1FwTzF4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnWDJOeVpXRjBaVlJsYzNSbGNpaGxZV05vWm00c0lHTm9aV05yTENCblpYUlNaWE4xYkhRcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWjFibU4wYVc5dUtHRnljaXdnYkdsdGFYUXNJR2wwWlhKaGRHOXlMQ0JqWWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnWkc5dVpTZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1kySXBJR05pS0dkbGRGSmxjM1ZzZENobVlXeHpaU3dnZG05cFpDQXdLU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCcGRHVnlZWFJsWlNoNExDQmZMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDZ2hZMklwSUhKbGRIVnliaUJqWVd4c1ltRmpheWdwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsMFpYSmhkRzl5S0hnc0lHWjFibU4wYVc5dUlDaDJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hqWWlBbUppQmphR1ZqYXloMktTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMklvWjJWMFVtVnpkV3gwS0hSeWRXVXNJSGdwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaUlEMGdhWFJsY21GMGIzSWdQU0JtWVd4elpUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5Z3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR0Z5WjNWdFpXNTBjeTVzWlc1bmRHZ2dQaUF6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pXRmphR1p1S0dGeWNpd2diR2x0YVhRc0lHbDBaWEpoZEdWbExDQmtiMjVsS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMklnUFNCcGRHVnlZWFJ2Y2p0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcGRHVnlZWFJ2Y2lBOUlHeHBiV2wwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdWaFkyaG1iaWhoY25Jc0lHbDBaWEpoZEdWbExDQmtiMjVsS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JoYzNsdVl5NWhibmtnUFZ4dUlDQWdJR0Z6ZVc1akxuTnZiV1VnUFNCZlkzSmxZWFJsVkdWemRHVnlLR0Z6ZVc1akxtVmhZMmhQWml3Z2RHOUNiMjlzTENCcFpHVnVkR2wwZVNrN1hHNWNiaUFnSUNCaGMzbHVZeTV6YjIxbFRHbHRhWFFnUFNCZlkzSmxZWFJsVkdWemRHVnlLR0Z6ZVc1akxtVmhZMmhQWmt4cGJXbDBMQ0IwYjBKdmIyd3NJR2xrWlc1MGFYUjVLVHRjYmx4dUlDQWdJR0Z6ZVc1akxtRnNiQ0E5WEc0Z0lDQWdZWE41Ym1NdVpYWmxjbmtnUFNCZlkzSmxZWFJsVkdWemRHVnlLR0Z6ZVc1akxtVmhZMmhQWml3Z2JtOTBTV1FzSUc1dmRFbGtLVHRjYmx4dUlDQWdJR0Z6ZVc1akxtVjJaWEo1VEdsdGFYUWdQU0JmWTNKbFlYUmxWR1Z6ZEdWeUtHRnplVzVqTG1WaFkyaFBaa3hwYldsMExDQnViM1JKWkN3Z2JtOTBTV1FwTzF4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnWDJacGJtUkhaWFJTWlhOMWJIUW9kaXdnZUNrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2VEdGNiaUFnSUNCOVhHNGdJQ0FnWVhONWJtTXVaR1YwWldOMElEMGdYMk55WldGMFpWUmxjM1JsY2loaGMzbHVZeTVsWVdOb1QyWXNJR2xrWlc1MGFYUjVMQ0JmWm1sdVpFZGxkRkpsYzNWc2RDazdYRzRnSUNBZ1lYTjVibU11WkdWMFpXTjBVMlZ5YVdWeklEMGdYMk55WldGMFpWUmxjM1JsY2loaGMzbHVZeTVsWVdOb1QyWlRaWEpwWlhNc0lHbGtaVzUwYVhSNUxDQmZabWx1WkVkbGRGSmxjM1ZzZENrN1hHNGdJQ0FnWVhONWJtTXVaR1YwWldOMFRHbHRhWFFnUFNCZlkzSmxZWFJsVkdWemRHVnlLR0Z6ZVc1akxtVmhZMmhQWmt4cGJXbDBMQ0JwWkdWdWRHbDBlU3dnWDJacGJtUkhaWFJTWlhOMWJIUXBPMXh1WEc0Z0lDQWdZWE41Ym1NdWMyOXlkRUo1SUQwZ1puVnVZM1JwYjI0Z0tHRnljaXdnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lHRnplVzVqTG0xaGNDaGhjbklzSUdaMWJtTjBhVzl1SUNoNExDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FYUmxjbUYwYjNJb2VDd2dablZ1WTNScGIyNGdLR1Z5Y2l3Z1kzSnBkR1Z5YVdFcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0dWeWNpazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWh1ZFd4c0xDQjdkbUZzZFdVNklIZ3NJR055YVhSbGNtbGhPaUJqY21sMFpYSnBZWDBwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnSUNCOUxDQm1kVzVqZEdsdmJpQW9aWEp5TENCeVpYTjFiSFJ6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1pYSnlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR05oYkd4aVlXTnJLR1Z5Y2lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlodWRXeHNMQ0JmYldGd0tISmxjM1ZzZEhNdWMyOXlkQ2hqYjIxd1lYSmhkRzl5S1N3Z1puVnVZM1JwYjI0Z0tIZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUhndWRtRnNkV1U3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNrcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lIMHBPMXh1WEc0Z0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUdOdmJYQmhjbUYwYjNJb2JHVm1kQ3dnY21sbmFIUXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJoSUQwZ2JHVm1kQzVqY21sMFpYSnBZU3dnWWlBOUlISnBaMmgwTG1OeWFYUmxjbWxoTzF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHRWdQQ0JpSUQ4Z0xURWdPaUJoSUQ0Z1lpQS9JREVnT2lBd08xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHRnplVzVqTG1GMWRHOGdQU0JtZFc1amRHbHZiaUFvZEdGemEzTXNJR052Ym1OMWNuSmxibU41TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQnBaaUFvZEhsd1pXOW1JR0Z5WjNWdFpXNTBjMXN4WFNBOVBUMGdKMloxYm1OMGFXOXVKeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdMeThnWTI5dVkzVnljbVZ1WTNrZ2FYTWdiM0IwYVc5dVlXd3NJSE5vYVdaMElIUm9aU0JoY21kekxseHVJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNnUFNCamIyNWpkWEp5Wlc1amVUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOdmJtTjFjbkpsYm1ONUlEMGdiblZzYkR0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5QTlJRjl2Ym1ObEtHTmhiR3hpWVdOcklIeDhJRzV2YjNBcE8xeHVJQ0FnSUNBZ0lDQjJZWElnYTJWNWN5QTlJRjlyWlhsektIUmhjMnR6S1R0Y2JpQWdJQ0FnSUNBZ2RtRnlJSEpsYldGcGJtbHVaMVJoYzJ0eklEMGdhMlY1Y3k1c1pXNW5kR2c3WEc0Z0lDQWdJQ0FnSUdsbUlDZ2hjbVZ0WVdsdWFXNW5WR0Z6YTNNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJqWVd4c1ltRmpheWh1ZFd4c0tUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JwWmlBb0lXTnZibU4xY25KbGJtTjVLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmpiMjVqZFhKeVpXNWplU0E5SUhKbGJXRnBibWx1WjFSaGMydHpPMXh1SUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ2RtRnlJSEpsYzNWc2RITWdQU0I3ZlR0Y2JpQWdJQ0FnSUNBZ2RtRnlJSEoxYm01cGJtZFVZWE5yY3lBOUlEQTdYRzVjYmlBZ0lDQWdJQ0FnZG1GeUlHaGhjMFZ5Y205eUlEMGdabUZzYzJVN1hHNWNiaUFnSUNBZ0lDQWdkbUZ5SUd4cGMzUmxibVZ5Y3lBOUlGdGRPMXh1SUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJoWkdSTWFYTjBaVzVsY2lobWJpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2JHbHpkR1Z1WlhKekxuVnVjMmhwWm5Rb1ptNHBPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUhKbGJXOTJaVXhwYzNSbGJtVnlLR1p1S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2FXUjRJRDBnWDJsdVpHVjRUMllvYkdsemRHVnVaWEp6TENCbWJpazdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9hV1I0SUQ0OUlEQXBJR3hwYzNSbGJtVnljeTV6Y0d4cFkyVW9hV1I0TENBeEtUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUIwWVhOclEyOXRjR3hsZEdVb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpXMWhhVzVwYm1kVVlYTnJjeTB0TzF4dUlDQWdJQ0FnSUNBZ0lDQWdYMkZ5Y21GNVJXRmphQ2hzYVhOMFpXNWxjbk11YzJ4cFkyVW9NQ2tzSUdaMWJtTjBhVzl1SUNobWJpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1p1S0NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJR0ZrWkV4cGMzUmxibVZ5S0daMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDZ2hjbVZ0WVdsdWFXNW5WR0Z6YTNNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aHVkV3hzTENCeVpYTjFiSFJ6S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlNrN1hHNWNiaUFnSUNBZ0lDQWdYMkZ5Y21GNVJXRmphQ2hyWlhsekxDQm1kVzVqZEdsdmJpQW9heWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0doaGMwVnljbTl5S1NCeVpYUjFjbTQ3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnZEdGemF5QTlJRjlwYzBGeWNtRjVLSFJoYzJ0elcydGRLU0EvSUhSaGMydHpXMnRkT2lCYmRHRnphM05iYTExZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlIUmhjMnREWVd4c1ltRmpheUE5SUY5eVpYTjBVR0Z5WVcwb1puVnVZM1JwYjI0b1pYSnlMQ0JoY21kektTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjblZ1Ym1sdVoxUmhjMnR6TFMwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR0Z5WjNNdWJHVnVaM1JvSUR3OUlERXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1lYSm5jeUE5SUdGeVozTmJNRjA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUhOaFptVlNaWE4xYkhSeklEMGdlMzA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lGOW1iM0pGWVdOb1QyWW9jbVZ6ZFd4MGN5d2dablZ1WTNScGIyNG9kbUZzTENCeWEyVjVLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J6WVdabFVtVnpkV3gwYzF0eWEyVjVYU0E5SUhaaGJEdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSE5oWm1WU1pYTjFiSFJ6VzJ0ZElEMGdZWEpuY3p0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhR0Z6UlhKeWIzSWdQU0IwY25WbE8xeHVYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0dWeWNpd2djMkZtWlZKbGMzVnNkSE1wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVnpkV3gwYzF0clhTQTlJR0Z5WjNNN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR0Z6ZVc1akxuTmxkRWx0YldWa2FXRjBaU2gwWVhOclEyOXRjR3hsZEdVcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlISmxjWFZwY21WeklEMGdkR0Z6YXk1emJHbGpaU2d3TENCMFlYTnJMbXhsYm1kMGFDQXRJREVwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdMeThnY0hKbGRtVnVkQ0JrWldGa0xXeHZZMnR6WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnYkdWdUlEMGdjbVZ4ZFdseVpYTXViR1Z1WjNSb08xeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHUmxjRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIZG9hV3hsSUNoc1pXNHRMU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDZ2hLR1JsY0NBOUlIUmhjMnR6VzNKbGNYVnBjbVZ6VzJ4bGJsMWRLU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb0owaGhjeUJ1YjI1bGVHbHpkR1Z1ZENCa1pYQmxibVJsYm1ONUlHbHVJQ2NnS3lCeVpYRjFhWEpsY3k1cWIybHVLQ2NzSUNjcEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0Y5cGMwRnljbUY1S0dSbGNDa2dKaVlnWDJsdVpHVjRUMllvWkdWd0xDQnJLU0ErUFNBd0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWduU0dGeklHTjVZMnhwWXlCa1pYQmxibVJsYm1OcFpYTW5LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCeVpXRmtlU2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnY25WdWJtbHVaMVJoYzJ0eklEd2dZMjl1WTNWeWNtVnVZM2tnSmlZZ1gzSmxaSFZqWlNoeVpYRjFhWEpsY3l3Z1puVnVZM1JwYjI0Z0tHRXNJSGdwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlDaGhJQ1ltSUhKbGMzVnNkSE11YUdGelQzZHVVSEp2Y0dWeWRIa29lQ2twTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwc0lIUnlkV1VwSUNZbUlDRnlaWE4xYkhSekxtaGhjMDkzYmxCeWIzQmxjblI1S0dzcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hKbFlXUjVLQ2twSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeWRXNXVhVzVuVkdGemEzTXJLenRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwWVhOclczUmhjMnN1YkdWdVozUm9JQzBnTVYwb2RHRnphME5oYkd4aVlXTnJMQ0J5WlhOMWJIUnpLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR0ZrWkV4cGMzUmxibVZ5S0d4cGMzUmxibVZ5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lHWjFibU4wYVc5dUlHeHBjM1JsYm1WeUtDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoeVpXRmtlU2dwS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEoxYm01cGJtZFVZWE5yY3lzck8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlcxdmRtVk1hWE4wWlc1bGNpaHNhWE4wWlc1bGNpazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSaGMydGJkR0Z6YXk1c1pXNW5kR2dnTFNBeFhTaDBZWE5yUTJGc2JHSmhZMnNzSUhKbGMzVnNkSE1wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnZlR0Y2JseHVYRzVjYmlBZ0lDQmhjM2x1WXk1eVpYUnllU0E5SUdaMWJtTjBhVzl1S0hScGJXVnpMQ0IwWVhOckxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ1JFVkdRVlZNVkY5VVNVMUZVeUE5SURVN1hHNGdJQ0FnSUNBZ0lIWmhjaUJFUlVaQlZVeFVYMGxPVkVWU1ZrRk1JRDBnTUR0Y2JseHVJQ0FnSUNBZ0lDQjJZWElnWVhSMFpXMXdkSE1nUFNCYlhUdGNibHh1SUNBZ0lDQWdJQ0IyWVhJZ2IzQjBjeUE5SUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFJwYldWek9pQkVSVVpCVlV4VVgxUkpUVVZUTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdhVzUwWlhKMllXdzZJRVJGUmtGVlRGUmZTVTVVUlZKV1FVeGNiaUFnSUNBZ0lDQWdmVHRjYmx4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCd1lYSnpaVlJwYldWektHRmpZeXdnZENsN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmloMGVYQmxiMllnZENBOVBUMGdKMjUxYldKbGNpY3BlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR0ZqWXk1MGFXMWxjeUE5SUhCaGNuTmxTVzUwS0hRc0lERXdLU0I4ZkNCRVJVWkJWVXhVWDFSSlRVVlRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUdsbUtIUjVjR1Z2WmlCMElEMDlQU0FuYjJKcVpXTjBKeWw3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWVdOakxuUnBiV1Z6SUQwZ2NHRnljMlZKYm5Rb2RDNTBhVzFsY3l3Z01UQXBJSHg4SUVSRlJrRlZURlJmVkVsTlJWTTdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZV05qTG1sdWRHVnlkbUZzSUQwZ2NHRnljMlZKYm5Rb2RDNXBiblJsY25aaGJDd2dNVEFwSUh4OElFUkZSa0ZWVEZSZlNVNVVSVkpXUVV3N1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJvY205M0lHNWxkeUJGY25KdmNpZ25WVzV6ZFhCd2IzSjBaV1FnWVhKbmRXMWxiblFnZEhsd1pTQm1iM0lnWEZ3bmRHbHRaWE5jWENjNklDY2dLeUIwZVhCbGIyWWdkQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNCMllYSWdiR1Z1WjNSb0lEMGdZWEpuZFcxbGJuUnpMbXhsYm1kMGFEdGNiaUFnSUNBZ0lDQWdhV1lnS0d4bGJtZDBhQ0E4SURFZ2ZId2diR1Z1WjNSb0lENGdNeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2h5YjNjZ2JtVjNJRVZ5Y205eUtDZEpiblpoYkdsa0lHRnlaM1Z0Wlc1MGN5QXRJRzExYzNRZ1ltVWdaV2wwYUdWeUlDaDBZWE5yS1N3Z0tIUmhjMnNzSUdOaGJHeGlZV05yS1N3Z0tIUnBiV1Z6TENCMFlYTnJLU0J2Y2lBb2RHbHRaWE1zSUhSaGMyc3NJR05oYkd4aVlXTnJLU2NwTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnYVdZZ0tHeGxibWQwYUNBOFBTQXlJQ1ltSUhSNWNHVnZaaUIwYVcxbGN5QTlQVDBnSjJaMWJtTjBhVzl1SnlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNnUFNCMFlYTnJPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RHRnpheUE5SUhScGJXVnpPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUdsbUlDaDBlWEJsYjJZZ2RHbHRaWE1nSVQwOUlDZG1kVzVqZEdsdmJpY3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIQmhjbk5sVkdsdFpYTW9iM0IwY3l3Z2RHbHRaWE1wTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lHOXdkSE11WTJGc2JHSmhZMnNnUFNCallXeHNZbUZqYXp0Y2JpQWdJQ0FnSUNBZ2IzQjBjeTUwWVhOcklEMGdkR0Z6YXp0Y2JseHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQjNjbUZ3Y0dWa1ZHRnpheWgzY21Gd2NHVmtRMkZzYkdKaFkyc3NJSGR5WVhCd1pXUlNaWE4xYkhSektTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCeVpYUnllVUYwZEdWdGNIUW9kR0Z6YXl3Z1ptbHVZV3hCZEhSbGJYQjBLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVLSE5sY21sbGMwTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSaGMyc29ablZ1WTNScGIyNG9aWEp5TENCeVpYTjFiSFFwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYzJWeWFXVnpRMkZzYkdKaFkyc29JV1Z5Y2lCOGZDQm1hVzVoYkVGMGRHVnRjSFFzSUh0bGNuSTZJR1Z5Y2l3Z2NtVnpkV3gwT2lCeVpYTjFiSFI5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU3dnZDNKaGNIQmxaRkpsYzNWc2RITXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzVjYmlBZ0lDQWdJQ0FnSUNBZ0lHWjFibU4wYVc5dUlISmxkSEo1U1c1MFpYSjJZV3dvYVc1MFpYSjJZV3dwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJtZFc1amRHbHZiaWh6WlhKcFpYTkRZV3hzWW1GamF5bDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhObGRGUnBiV1Z2ZFhRb1puVnVZM1JwYjI0b0tYdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lITmxjbWxsYzBOaGJHeGlZV05yS0c1MWJHd3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUxDQnBiblJsY25aaGJDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0FnSUNBZ2QyaHBiR1VnS0c5d2RITXVkR2x0WlhNcElIdGNibHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCbWFXNWhiRUYwZEdWdGNIUWdQU0FoS0c5d2RITXVkR2x0WlhNdFBURXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR0YwZEdWdGNIUnpMbkIxYzJnb2NtVjBjbmxCZEhSbGJYQjBLRzl3ZEhNdWRHRnpheXdnWm1sdVlXeEJkSFJsYlhCMEtTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lvSVdacGJtRnNRWFIwWlcxd2RDQW1KaUJ2Y0hSekxtbHVkR1Z5ZG1Gc0lENGdNQ2w3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRjBkR1Z0Y0hSekxuQjFjMmdvY21WMGNubEpiblJsY25aaGJDaHZjSFJ6TG1sdWRHVnlkbUZzS1NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lDQWdJQ0JoYzNsdVl5NXpaWEpwWlhNb1lYUjBaVzF3ZEhNc0lHWjFibU4wYVc5dUtHUnZibVVzSUdSaGRHRXBlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1JoZEdFZ1BTQmtZWFJoVzJSaGRHRXViR1Z1WjNSb0lDMGdNVjA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnS0hkeVlYQndaV1JEWVd4c1ltRmpheUI4ZkNCdmNIUnpMbU5oYkd4aVlXTnJLU2hrWVhSaExtVnljaXdnWkdGMFlTNXlaWE4xYkhRcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0F2THlCSlppQmhJR05oYkd4aVlXTnJJR2x6SUhCaGMzTmxaQ3dnY25WdUlIUm9hWE1nWVhNZ1lTQmpiMjUwY205c2JDQm1iRzkzWEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJ2Y0hSekxtTmhiR3hpWVdOcklEOGdkM0poY0hCbFpGUmhjMnNvS1NBNklIZHlZWEJ3WldSVVlYTnJPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQmhjM2x1WXk1M1lYUmxjbVpoYkd3Z1BTQm1kVzVqZEdsdmJpQW9kR0Z6YTNNc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJR05oYkd4aVlXTnJJRDBnWDI5dVkyVW9ZMkZzYkdKaFkyc2dmSHdnYm05dmNDazdYRzRnSUNBZ0lDQWdJR2xtSUNnaFgybHpRWEp5WVhrb2RHRnphM01wS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1pYSnlJRDBnYm1WM0lFVnljbTl5S0NkR2FYSnpkQ0JoY21kMWJXVnVkQ0IwYnlCM1lYUmxjbVpoYkd3Z2JYVnpkQ0JpWlNCaGJpQmhjbkpoZVNCdlppQm1kVzVqZEdsdmJuTW5LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCallXeHNZbUZqYXlobGNuSXBPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUdsbUlDZ2hkR0Z6YTNNdWJHVnVaM1JvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdZMkZzYkdKaFkyc29LVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCM2NtRndTWFJsY21GMGIzSW9hWFJsY21GMGIzSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCZmNtVnpkRkJoY21GdEtHWjFibU4wYVc5dUlDaGxjbklzSUdGeVozTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1pYSnlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOckxtRndjR3g1S0c1MWJHd3NJRnRsY25KZExtTnZibU5oZENoaGNtZHpLU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllYSWdibVY0ZENBOUlHbDBaWEpoZEc5eUxtNWxlSFFvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0c1bGVIUXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR0Z5WjNNdWNIVnphQ2gzY21Gd1NYUmxjbUYwYjNJb2JtVjRkQ2twTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZWEpuY3k1d2RYTm9LR05oYkd4aVlXTnJLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JsYm5OMWNtVkJjM2x1WXlocGRHVnlZWFJ2Y2lrdVlYQndiSGtvYm5Wc2JDd2dZWEpuY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdkM0poY0VsMFpYSmhkRzl5S0dGemVXNWpMbWwwWlhKaGRHOXlLSFJoYzJ0ektTa29LVHRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdablZ1WTNScGIyNGdYM0JoY21Gc2JHVnNLR1ZoWTJobWJpd2dkR0Z6YTNNc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJR05oYkd4aVlXTnJJRDBnWTJGc2JHSmhZMnNnZkh3Z2JtOXZjRHRjYmlBZ0lDQWdJQ0FnZG1GeUlISmxjM1ZzZEhNZ1BTQmZhWE5CY25KaGVVeHBhMlVvZEdGemEzTXBJRDhnVzEwZ09pQjdmVHRjYmx4dUlDQWdJQ0FnSUNCbFlXTm9abTRvZEdGemEzTXNJR1oxYm1OMGFXOXVJQ2gwWVhOckxDQnJaWGtzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwWVhOcktGOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNGdLR1Z5Y2l3Z1lYSm5jeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaGhjbWR6TG14bGJtZDBhQ0E4UFNBeEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGeVozTWdQU0JoY21keld6QmRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMWJIUnpXMnRsZVYwZ1BTQmhjbWR6TzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0dWeWNpazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtTazdYRzRnSUNBZ0lDQWdJSDBzSUdaMWJtTjBhVzl1SUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHVnljaXdnY21WemRXeDBjeWs3WEc0Z0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdGemVXNWpMbkJoY21Gc2JHVnNJRDBnWm5WdVkzUnBiMjRnS0hSaGMydHpMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCZmNHRnlZV3hzWld3b1lYTjVibU11WldGamFFOW1MQ0IwWVhOcmN5d2dZMkZzYkdKaFkyc3BPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQmhjM2x1WXk1d1lYSmhiR3hsYkV4cGJXbDBJRDBnWm5WdVkzUnBiMjRvZEdGemEzTXNJR3hwYldsMExDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0JmY0dGeVlXeHNaV3dvWDJWaFkyaFBaa3hwYldsMEtHeHBiV2wwS1N3Z2RHRnphM01zSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnWVhONWJtTXVjMlZ5YVdWeklEMGdablZ1WTNScGIyNG9kR0Z6YTNNc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJRjl3WVhKaGJHeGxiQ2hoYzNsdVl5NWxZV05vVDJaVFpYSnBaWE1zSUhSaGMydHpMQ0JqWVd4c1ltRmpheWs3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR0Z6ZVc1akxtbDBaWEpoZEc5eUlEMGdablZ1WTNScGIyNGdLSFJoYzJ0ektTQjdYRzRnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJRzFoYTJWRFlXeHNZbUZqYXlocGJtUmxlQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdablZ1WTNScGIyNGdabTRvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSFJoYzJ0ekxteGxibWQwYUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwWVhOcmMxdHBibVJsZUYwdVlYQndiSGtvYm5Wc2JDd2dZWEpuZFcxbGJuUnpLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1p1TG01bGVIUW9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUdadUxtNWxlSFFnUFNCbWRXNWpkR2x2YmlBb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlDaHBibVJsZUNBOElIUmhjMnR6TG14bGJtZDBhQ0F0SURFcElEOGdiV0ZyWlVOaGJHeGlZV05yS0dsdVpHVjRJQ3NnTVNrNklHNTFiR3c3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdadU8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQnRZV3RsUTJGc2JHSmhZMnNvTUNrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbUZ3Y0d4NUlEMGdYM0psYzNSUVlYSmhiU2htZFc1amRHbHZiaUFvWm00c0lHRnlaM01wSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUY5eVpYTjBVR0Z5WVcwb1puVnVZM1JwYjI0Z0tHTmhiR3hCY21kektTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWm00dVlYQndiSGtvWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYm5Wc2JDd2dZWEpuY3k1amIyNWpZWFFvWTJGc2JFRnlaM01wWEc0Z0lDQWdJQ0FnSUNBZ0lDQXBPMXh1SUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0I5S1R0Y2JseHVJQ0FnSUdaMWJtTjBhVzl1SUY5amIyNWpZWFFvWldGamFHWnVMQ0JoY25Jc0lHWnVMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCMllYSWdjbVZ6ZFd4MElEMGdXMTA3WEc0Z0lDQWdJQ0FnSUdWaFkyaG1iaWhoY25Jc0lHWjFibU4wYVc5dUlDaDRMQ0JwYm1SbGVDd2dZMklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR1p1S0hnc0lHWjFibU4wYVc5dUlDaGxjbklzSUhrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWE4xYkhRZ1BTQnlaWE4xYkhRdVkyOXVZMkYwS0hrZ2ZId2dXMTBwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaUtHVnljaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnZlN3Z1puVnVZM1JwYjI0Z0tHVnljaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc29aWEp5TENCeVpYTjFiSFFwTzF4dUlDQWdJQ0FnSUNCOUtUdGNiaUFnSUNCOVhHNGdJQ0FnWVhONWJtTXVZMjl1WTJGMElEMGdaRzlRWVhKaGJHeGxiQ2hmWTI5dVkyRjBLVHRjYmlBZ0lDQmhjM2x1WXk1amIyNWpZWFJUWlhKcFpYTWdQU0JrYjFObGNtbGxjeWhmWTI5dVkyRjBLVHRjYmx4dUlDQWdJR0Z6ZVc1akxuZG9hV3h6ZENBOUlHWjFibU4wYVc5dUlDaDBaWE4wTENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdZMkZzYkdKaFkyc2dQU0JqWVd4c1ltRmpheUI4ZkNCdWIyOXdPMXh1SUNBZ0lDQWdJQ0JwWmlBb2RHVnpkQ2dwS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2JtVjRkQ0E5SUY5eVpYTjBVR0Z5WVcwb1puVnVZM1JwYjI0b1pYSnlMQ0JoY21kektTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dWeWNpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlobGNuSXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQnBaaUFvZEdWemRDNWhjSEJzZVNoMGFHbHpMQ0JoY21kektTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcGRHVnlZWFJ2Y2lodVpYaDBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXk1aGNIQnNlU2h1ZFd4c0xDQmJiblZzYkYwdVkyOXVZMkYwS0dGeVozTXBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbDBaWEpoZEc5eUtHNWxlSFFwTzF4dUlDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc29iblZzYkNrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11Wkc5WGFHbHNjM1FnUFNCbWRXNWpkR2x2YmlBb2FYUmxjbUYwYjNJc0lIUmxjM1FzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJqWVd4c2N5QTlJREE3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJoYzNsdVl5NTNhR2xzYzNRb1puVnVZM1JwYjI0b0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnS3l0allXeHNjeUE4UFNBeElIeDhJSFJsYzNRdVlYQndiSGtvZEdocGN5d2dZWEpuZFcxbGJuUnpLVHRjYmlBZ0lDQWdJQ0FnZlN3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktUdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11ZFc1MGFXd2dQU0JtZFc1amRHbHZiaUFvZEdWemRDd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJoYzNsdVl5NTNhR2xzYzNRb1puVnVZM1JwYjI0b0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnSVhSbGMzUXVZWEJ3Ykhrb2RHaHBjeXdnWVhKbmRXMWxiblJ6S1R0Y2JpQWdJQ0FnSUNBZ2ZTd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdZWE41Ym1NdVpHOVZiblJwYkNBOUlHWjFibU4wYVc5dUlDaHBkR1Z5WVhSdmNpd2dkR1Z6ZEN3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHRnplVzVqTG1SdlYyaHBiSE4wS0dsMFpYSmhkRzl5TENCbWRXNWpkR2x2YmlncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUFoZEdWemRDNWhjSEJzZVNoMGFHbHpMQ0JoY21kMWJXVnVkSE1wTzF4dUlDQWdJQ0FnSUNCOUxDQmpZV3hzWW1GamF5azdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHRnplVzVqTG1SMWNtbHVaeUE5SUdaMWJtTjBhVzl1SUNoMFpYTjBMQ0JwZEdWeVlYUnZjaXdnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ1kyRnNiR0poWTJzZ1BTQmpZV3hzWW1GamF5QjhmQ0J1YjI5d08xeHVYRzRnSUNBZ0lDQWdJSFpoY2lCdVpYaDBJRDBnWDNKbGMzUlFZWEpoYlNobWRXNWpkR2x2YmlobGNuSXNJR0Z5WjNNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlobGNuSXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCaGNtZHpMbkIxYzJnb1kyaGxZMnNwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSbGMzUXVZWEJ3Ykhrb2RHaHBjeXdnWVhKbmN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lIMHBPMXh1WEc0Z0lDQWdJQ0FnSUhaaGNpQmphR1ZqYXlBOUlHWjFibU4wYVc5dUtHVnljaXdnZEhKMWRHZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hsY25JcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aGxjbklwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElHbG1JQ2gwY25WMGFDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2wwWlhKaGRHOXlLRzVsZUhRcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWh1ZFd4c0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZUdGNibHh1SUNBZ0lDQWdJQ0IwWlhOMEtHTm9aV05yS1R0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnWVhONWJtTXVaRzlFZFhKcGJtY2dQU0JtZFc1amRHbHZiaUFvYVhSbGNtRjBiM0lzSUhSbGMzUXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUhaaGNpQmpZV3hzY3lBOUlEQTdYRzRnSUNBZ0lDQWdJR0Z6ZVc1akxtUjFjbWx1WnlobWRXNWpkR2x2YmlodVpYaDBLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWTJGc2JITXJLeUE4SURFcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnVaWGgwS0c1MWJHd3NJSFJ5ZFdVcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwWlhOMExtRndjR3g1S0hSb2FYTXNJR0Z5WjNWdFpXNTBjeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDBzSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdaMWJtTjBhVzl1SUY5eGRXVjFaU2gzYjNKclpYSXNJR052Ym1OMWNuSmxibU41TENCd1lYbHNiMkZrS1NCN1hHNGdJQ0FnSUNBZ0lHbG1JQ2hqYjI1amRYSnlaVzVqZVNBOVBTQnVkV3hzS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqYjI1amRYSnlaVzVqZVNBOUlERTdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnWld4elpTQnBaaWhqYjI1amRYSnlaVzVqZVNBOVBUMGdNQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR2h5YjNjZ2JtVjNJRVZ5Y205eUtDZERiMjVqZFhKeVpXNWplU0J0ZFhOMElHNXZkQ0JpWlNCNlpYSnZKeWs3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z1gybHVjMlZ5ZENoeExDQmtZWFJoTENCd2IzTXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWTJGc2JHSmhZMnNnSVQwZ2JuVnNiQ0FtSmlCMGVYQmxiMllnWTJGc2JHSmhZMnNnSVQwOUlGd2lablZ1WTNScGIyNWNJaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWhjSW5SaGMyc2dZMkZzYkdKaFkyc2diWFZ6ZENCaVpTQmhJR1oxYm1OMGFXOXVYQ0lwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2NTNXpkR0Z5ZEdWa0lEMGdkSEoxWlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNnaFgybHpRWEp5WVhrb1pHRjBZU2twSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCa1lYUmhJRDBnVzJSaGRHRmRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZb1pHRjBZUzVzWlc1bmRHZ2dQVDA5SURBZ0ppWWdjUzVwWkd4bEtDa3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0F2THlCallXeHNJR1J5WVdsdUlHbHRiV1ZrYVdGMFpXeDVJR2xtSUhSb1pYSmxJR0Z5WlNCdWJ5QjBZWE5yYzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJoYzNsdVl5NXpaWFJKYlcxbFpHbGhkR1VvWm5WdVkzUnBiMjRvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1WkhKaGFXNG9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lGOWhjbkpoZVVWaFkyZ29aR0YwWVN3Z1puVnVZM1JwYjI0b2RHRnpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGNpQnBkR1Z0SUQwZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JrWVhSaE9pQjBZWE5yTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF6b2dZMkZzYkdKaFkyc2dmSHdnYm05dmNGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMDdYRzVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2NHOXpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRXVkR0Z6YTNNdWRXNXphR2xtZENocGRHVnRLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeExuUmhjMnR6TG5CMWMyZ29hWFJsYlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hFdWRHRnphM011YkdWdVozUm9JRDA5UFNCeExtTnZibU4xY25KbGJtTjVLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRXVjMkYwZFhKaGRHVmtLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQmhjM2x1WXk1elpYUkpiVzFsWkdsaGRHVW9jUzV3Y205alpYTnpLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCZmJtVjRkQ2h4TENCMFlYTnJjeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHWjFibU4wYVc5dUtDbDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkMjl5YTJWeWN5QXRQU0F4TzF4dVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJSEpsYlc5MlpXUWdQU0JtWVd4elpUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnWVhKbmN5QTlJR0Z5WjNWdFpXNTBjenRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JmWVhKeVlYbEZZV05vS0hSaGMydHpMQ0JtZFc1amRHbHZiaUFvZEdGemF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCZllYSnlZWGxGWVdOb0tIZHZjbXRsY25OTWFYTjBMQ0JtZFc1amRHbHZiaUFvZDI5eWEyVnlMQ0JwYm1SbGVDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hkdmNtdGxjaUE5UFQwZ2RHRnpheUFtSmlBaGNtVnRiM1psWkNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSGR2Y210bGNuTk1hWE4wTG5Od2JHbGpaU2hwYm1SbGVDd2dNU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVnRiM1psWkNBOUlIUnlkV1U3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUmhjMnN1WTJGc2JHSmhZMnN1WVhCd2JIa29kR0Z6YXl3Z1lYSm5jeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLSEV1ZEdGemEzTXViR1Z1WjNSb0lDc2dkMjl5YTJWeWN5QTlQVDBnTUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J4TG1SeVlXbHVLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdWNISnZZMlZ6Y3lncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJSFpoY2lCM2IzSnJaWEp6SUQwZ01EdGNiaUFnSUNBZ0lDQWdkbUZ5SUhkdmNtdGxjbk5NYVhOMElEMGdXMTA3WEc0Z0lDQWdJQ0FnSUhaaGNpQnhJRDBnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkR0Z6YTNNNklGdGRMRnh1SUNBZ0lDQWdJQ0FnSUNBZ1kyOXVZM1Z5Y21WdVkzazZJR052Ym1OMWNuSmxibU41TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdjR0Y1Ykc5aFpEb2djR0Y1Ykc5aFpDeGNiaUFnSUNBZ0lDQWdJQ0FnSUhOaGRIVnlZWFJsWkRvZ2JtOXZjQ3hjYmlBZ0lDQWdJQ0FnSUNBZ0lHVnRjSFI1T2lCdWIyOXdMRnh1SUNBZ0lDQWdJQ0FnSUNBZ1pISmhhVzQ2SUc1dmIzQXNYRzRnSUNBZ0lDQWdJQ0FnSUNCemRHRnlkR1ZrT2lCbVlXeHpaU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lIQmhkWE5sWkRvZ1ptRnNjMlVzWEc0Z0lDQWdJQ0FnSUNBZ0lDQndkWE5vT2lCbWRXNWpkR2x2YmlBb1pHRjBZU3dnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCZmFXNXpaWEowS0hFc0lHUmhkR0VzSUdaaGJITmxMQ0JqWVd4c1ltRmpheWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlMRnh1SUNBZ0lDQWdJQ0FnSUNBZ2EybHNiRG9nWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRXVaSEpoYVc0Z1BTQnViMjl3TzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdWRHRnphM01nUFNCYlhUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwc1hHNGdJQ0FnSUNBZ0lDQWdJQ0IxYm5Ob2FXWjBPaUJtZFc1amRHbHZiaUFvWkdGMFlTd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JmYVc1elpYSjBLSEVzSUdSaGRHRXNJSFJ5ZFdVc0lHTmhiR3hpWVdOcktUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwc1hHNGdJQ0FnSUNBZ0lDQWdJQ0J3Y205alpYTnpPaUJtZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2QyaHBiR1VvSVhFdWNHRjFjMlZrSUNZbUlIZHZjbXRsY25NZ1BDQnhMbU52Ym1OMWNuSmxibU41SUNZbUlIRXVkR0Z6YTNNdWJHVnVaM1JvS1h0Y2JseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2RHRnphM01nUFNCeExuQmhlV3h2WVdRZ1AxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NTNTBZWE5yY3k1emNHeHBZMlVvTUN3Z2NTNXdZWGxzYjJGa0tTQTZYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnhMblJoYzJ0ekxuTndiR2xqWlNnd0xDQnhMblJoYzJ0ekxteGxibWQwYUNrN1hHNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHUmhkR0VnUFNCZmJXRndLSFJoYzJ0ekxDQm1kVzVqZEdsdmJpQW9kR0Z6YXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUhSaGMyc3VaR0YwWVR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hFdWRHRnphM011YkdWdVozUm9JRDA5UFNBd0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnhMbVZ0Y0hSNUtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkMjl5YTJWeWN5QXJQU0F4TzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjNiM0pyWlhKelRHbHpkQzV3ZFhOb0tIUmhjMnR6V3pCZEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHTmlJRDBnYjI1c2VWOXZibU5sS0Y5dVpYaDBLSEVzSUhSaGMydHpLU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIZHZjbXRsY2loa1lYUmhMQ0JqWWlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlN4Y2JpQWdJQ0FnSUNBZ0lDQWdJR3hsYm1kMGFEb2dablZ1WTNScGIyNGdLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJ4TG5SaGMydHpMbXhsYm1kMGFEdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwc1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5ZFc1dWFXNW5PaUJtZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUhkdmNtdGxjbk03WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlMRnh1SUNBZ0lDQWdJQ0FnSUNBZ2QyOXlhMlZ5YzB4cGMzUTZJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnZDI5eWEyVnljMHhwYzNRN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdhV1JzWlRvZ1puVnVZM1JwYjI0b0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlIRXVkR0Z6YTNNdWJHVnVaM1JvSUNzZ2QyOXlhMlZ5Y3lBOVBUMGdNRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHNYRzRnSUNBZ0lDQWdJQ0FnSUNCd1lYVnpaVG9nWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRXVjR0YxYzJWa0lEMGdkSEoxWlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWE4xYldVNklHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2NTNXdZWFZ6WldRZ1BUMDlJR1poYkhObEtTQjdJSEpsZEhWeWJqc2dmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1Y0dGMWMyVmtJRDBnWm1Gc2MyVTdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUhKbGMzVnRaVU52ZFc1MElEMGdUV0YwYUM1dGFXNG9jUzVqYjI1amRYSnlaVzVqZVN3Z2NTNTBZWE5yY3k1c1pXNW5kR2dwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUM4dklFNWxaV1FnZEc4Z1kyRnNiQ0J4TG5CeWIyTmxjM01nYjI1alpTQndaWElnWTI5dVkzVnljbVZ1ZEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUM4dklIZHZjbXRsY2lCMGJ5QndjbVZ6WlhKMlpTQm1kV3hzSUdOdmJtTjFjbkpsYm1ONUlHRm1kR1Z5SUhCaGRYTmxYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdabTl5SUNoMllYSWdkeUE5SURFN0lIY2dQRDBnY21WemRXMWxRMjkxYm5RN0lIY3JLeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmhjM2x1WXk1elpYUkpiVzFsWkdsaGRHVW9jUzV3Y205alpYTnpLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDA3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJ4TzF4dUlDQWdJSDFjYmx4dUlDQWdJR0Z6ZVc1akxuRjFaWFZsSUQwZ1puVnVZM1JwYjI0Z0tIZHZjbXRsY2l3Z1kyOXVZM1Z5Y21WdVkza3BJSHRjYmlBZ0lDQWdJQ0FnZG1GeUlIRWdQU0JmY1hWbGRXVW9ablZ1WTNScGIyNGdLR2wwWlcxekxDQmpZaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkMjl5YTJWeUtHbDBaVzF6V3pCZExDQmpZaWs3WEc0Z0lDQWdJQ0FnSUgwc0lHTnZibU4xY25KbGJtTjVMQ0F4S1R0Y2JseHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2NUdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11Y0hKcGIzSnBkSGxSZFdWMVpTQTlJR1oxYm1OMGFXOXVJQ2gzYjNKclpYSXNJR052Ym1OMWNuSmxibU41S1NCN1hHNWNiaUFnSUNBZ0lDQWdablZ1WTNScGIyNGdYMk52YlhCaGNtVlVZWE5yY3loaExDQmlLWHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCaExuQnlhVzl5YVhSNUlDMGdZaTV3Y21sdmNtbDBlVHRjYmlBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lHWjFibU4wYVc5dUlGOWlhVzVoY25sVFpXRnlZMmdvYzJWeGRXVnVZMlVzSUdsMFpXMHNJR052YlhCaGNtVXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJpWldjZ1BTQXRNU3hjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JsYm1RZ1BTQnpaWEYxWlc1alpTNXNaVzVuZEdnZ0xTQXhPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2QyaHBiR1VnS0dKbFp5QThJR1Z1WkNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJ0YVdRZ1BTQmlaV2NnS3lBb0tHVnVaQ0F0SUdKbFp5QXJJREVwSUQ0K1BpQXhLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1kyOXRjR0Z5WlNocGRHVnRMQ0J6WlhGMVpXNWpaVnR0YVdSZEtTQStQU0F3S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR0psWnlBOUlHMXBaRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbGJtUWdQU0J0YVdRZ0xTQXhPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJpWldjN1hHNGdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUJmYVc1elpYSjBLSEVzSUdSaGRHRXNJSEJ5YVc5eWFYUjVMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dOaGJHeGlZV05ySUNFOUlHNTFiR3dnSmlZZ2RIbHdaVzltSUdOaGJHeGlZV05ySUNFOVBTQmNJbVoxYm1OMGFXOXVYQ0lwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMGFISnZkeUJ1WlhjZ1JYSnliM0lvWENKMFlYTnJJR05oYkd4aVlXTnJJRzExYzNRZ1ltVWdZU0JtZFc1amRHbHZibHdpS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIRXVjM1JoY25SbFpDQTlJSFJ5ZFdVN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb0lWOXBjMEZ5Y21GNUtHUmhkR0VwS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pHRjBZU0E5SUZ0a1lYUmhYVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUtHUmhkR0V1YkdWdVozUm9JRDA5UFNBd0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdMeThnWTJGc2JDQmtjbUZwYmlCcGJXMWxaR2xoZEdWc2VTQnBaaUIwYUdWeVpTQmhjbVVnYm04Z2RHRnphM05jYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdZWE41Ym1NdWMyVjBTVzF0WldScFlYUmxLR1oxYm1OMGFXOXVLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnhMbVJ5WVdsdUtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCZllYSnlZWGxGWVdOb0tHUmhkR0VzSUdaMWJtTjBhVzl1S0hSaGMyc3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2FYUmxiU0E5SUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaR0YwWVRvZ2RHRnpheXhjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NISnBiM0pwZEhrNklIQnlhVzl5YVhSNUxGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmphem9nZEhsd1pXOW1JR05oYkd4aVlXTnJJRDA5UFNBblpuVnVZM1JwYjI0bklEOGdZMkZzYkdKaFkyc2dPaUJ1YjI5d1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZUdGNibHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1ZEdGemEzTXVjM0JzYVdObEtGOWlhVzVoY25sVFpXRnlZMmdvY1M1MFlYTnJjeXdnYVhSbGJTd2dYMk52YlhCaGNtVlVZWE5yY3lrZ0t5QXhMQ0F3TENCcGRHVnRLVHRjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaHhMblJoYzJ0ekxteGxibWQwYUNBOVBUMGdjUzVqYjI1amRYSnlaVzVqZVNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J4TG5OaGRIVnlZWFJsWkNncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmhjM2x1WXk1elpYUkpiVzFsWkdsaGRHVW9jUzV3Y205alpYTnpLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ0x5OGdVM1JoY25RZ2QybDBhQ0JoSUc1dmNtMWhiQ0J4ZFdWMVpWeHVJQ0FnSUNBZ0lDQjJZWElnY1NBOUlHRnplVzVqTG5GMVpYVmxLSGR2Y210bGNpd2dZMjl1WTNWeWNtVnVZM2twTzF4dVhHNGdJQ0FnSUNBZ0lDOHZJRTkyWlhKeWFXUmxJSEIxYzJnZ2RHOGdZV05qWlhCMElITmxZMjl1WkNCd1lYSmhiV1YwWlhJZ2NtVndjbVZ6Wlc1MGFXNW5JSEJ5YVc5eWFYUjVYRzRnSUNBZ0lDQWdJSEV1Y0hWemFDQTlJR1oxYm1OMGFXOXVJQ2hrWVhSaExDQndjbWx2Y21sMGVTd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lGOXBibk5sY25Rb2NTd2daR0YwWVN3Z2NISnBiM0pwZEhrc0lHTmhiR3hpWVdOcktUdGNiaUFnSUNBZ0lDQWdmVHRjYmx4dUlDQWdJQ0FnSUNBdkx5QlNaVzF2ZG1VZ2RXNXphR2xtZENCbWRXNWpkR2x2Ymx4dUlDQWdJQ0FnSUNCa1pXeGxkR1VnY1M1MWJuTm9hV1owTzF4dVhHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCeE8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNCaGMzbHVZeTVqWVhKbmJ5QTlJR1oxYm1OMGFXOXVJQ2gzYjNKclpYSXNJSEJoZVd4dllXUXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJRjl4ZFdWMVpTaDNiM0pyWlhJc0lERXNJSEJoZVd4dllXUXBPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmZZMjl1YzI5c1pWOW1iaWh1WVcxbEtTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQmZjbVZ6ZEZCaGNtRnRLR1oxYm1OMGFXOXVJQ2htYml3Z1lYSm5jeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdabTR1WVhCd2JIa29iblZzYkN3Z1lYSm5jeTVqYjI1allYUW9XMTl5WlhOMFVHRnlZVzBvWm5WdVkzUnBiMjRnS0dWeWNpd2dZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2gwZVhCbGIyWWdZMjl1YzI5c1pTQTlQVDBnSjI5aWFtVmpkQ2NwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dWeWNpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dOdmJuTnZiR1V1WlhKeWIzSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCamIyNXpiMnhsTG1WeWNtOXlLR1Z5Y2lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1pXeHpaU0JwWmlBb1kyOXVjMjlzWlZ0dVlXMWxYU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWDJGeWNtRjVSV0ZqYUNoaGNtZHpMQ0JtZFc1amRHbHZiaUFvZUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR052Ym5OdmJHVmJibUZ0WlYwb2VDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUgwcFhTa3BPMXh1SUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0I5WEc0Z0lDQWdZWE41Ym1NdWJHOW5JRDBnWDJOdmJuTnZiR1ZmWm00b0oyeHZaeWNwTzF4dUlDQWdJR0Z6ZVc1akxtUnBjaUE5SUY5amIyNXpiMnhsWDJadUtDZGthWEluS1R0Y2JpQWdJQ0F2S21GemVXNWpMbWx1Wm04Z1BTQmZZMjl1YzI5c1pWOW1iaWduYVc1bWJ5Y3BPMXh1SUNBZ0lHRnplVzVqTG5kaGNtNGdQU0JmWTI5dWMyOXNaVjltYmlnbmQyRnliaWNwTzF4dUlDQWdJR0Z6ZVc1akxtVnljbTl5SUQwZ1gyTnZibk52YkdWZlptNG9KMlZ5Y205eUp5azdLaTljYmx4dUlDQWdJR0Z6ZVc1akxtMWxiVzlwZW1VZ1BTQm1kVzVqZEdsdmJpQW9abTRzSUdoaGMyaGxjaWtnZTF4dUlDQWdJQ0FnSUNCMllYSWdiV1Z0YnlBOUlIdDlPMXh1SUNBZ0lDQWdJQ0IyWVhJZ2NYVmxkV1Z6SUQwZ2UzMDdYRzRnSUNBZ0lDQWdJSFpoY2lCb1lYTWdQU0JQWW1wbFkzUXVjSEp2ZEc5MGVYQmxMbWhoYzA5M2JsQnliM0JsY25SNU8xeHVJQ0FnSUNBZ0lDQm9ZWE5vWlhJZ1BTQm9ZWE5vWlhJZ2ZId2dhV1JsYm5ScGRIazdYRzRnSUNBZ0lDQWdJSFpoY2lCdFpXMXZhWHBsWkNBOUlGOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNGdiV1Z0YjJsNlpXUW9ZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHTmhiR3hpWVdOcklEMGdZWEpuY3k1d2IzQW9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJyWlhrZ1BTQm9ZWE5vWlhJdVlYQndiSGtvYm5Wc2JDd2dZWEpuY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2FHRnpMbU5oYkd3b2JXVnRieXdnYTJWNUtTa2dleUFnSUZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGemVXNWpMbk5sZEVsdGJXVmthV0YwWlNobWRXNWpkR2x2YmlBb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yTG1Gd2NHeDVLRzUxYkd3c0lHMWxiVzliYTJWNVhTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCbGJITmxJR2xtSUNob1lYTXVZMkZzYkNoeGRXVjFaWE1zSUd0bGVTa3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J4ZFdWMVpYTmJhMlY1WFM1d2RYTm9LR05oYkd4aVlXTnJLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEYxWlhWbGMxdHJaWGxkSUQwZ1cyTmhiR3hpWVdOclhUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQm1iaTVoY0hCc2VTaHVkV3hzTENCaGNtZHpMbU52Ym1OaGRDaGJYM0psYzNSUVlYSmhiU2htZFc1amRHbHZiaUFvWVhKbmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCdFpXMXZXMnRsZVYwZ1BTQmhjbWR6TzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnY1NBOUlIRjFaWFZsYzF0clpYbGRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCa1pXeGxkR1VnY1hWbGRXVnpXMnRsZVYwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR1p2Y2lBb2RtRnlJR2tnUFNBd0xDQnNJRDBnY1M1c1pXNW5kR2c3SUdrZ1BDQnNPeUJwS3lzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRmJhVjB1WVhCd2JIa29iblZzYkN3Z1lYSm5jeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlLVjBwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lHMWxiVzlwZW1Wa0xtMWxiVzhnUFNCdFpXMXZPMXh1SUNBZ0lDQWdJQ0J0WlcxdmFYcGxaQzUxYm0xbGJXOXBlbVZrSUQwZ1ptNDdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQnRaVzF2YVhwbFpEdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11ZFc1dFpXMXZhWHBsSUQwZ1puVnVZM1JwYjI0Z0tHWnVLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJtZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdLR1p1TG5WdWJXVnRiMmw2WldRZ2ZId2dabTRwTG1Gd2NHeDVLRzUxYkd3c0lHRnlaM1Z0Wlc1MGN5azdYRzRnSUNBZ0lDQWdJSDA3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjkwYVcxbGN5aHRZWEJ3WlhJcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWjFibU4wYVc5dUlDaGpiM1Z1ZEN3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCdFlYQndaWElvWDNKaGJtZGxLR052ZFc1MEtTd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JoYzNsdVl5NTBhVzFsY3lBOUlGOTBhVzFsY3loaGMzbHVZeTV0WVhBcE8xeHVJQ0FnSUdGemVXNWpMblJwYldWelUyVnlhV1Z6SUQwZ1gzUnBiV1Z6S0dGemVXNWpMbTFoY0ZObGNtbGxjeWs3WEc0Z0lDQWdZWE41Ym1NdWRHbHRaWE5NYVcxcGRDQTlJR1oxYm1OMGFXOXVJQ2hqYjNWdWRDd2diR2x0YVhRc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdZWE41Ym1NdWJXRndUR2x0YVhRb1gzSmhibWRsS0dOdmRXNTBLU3dnYkdsdGFYUXNJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWs3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR0Z6ZVc1akxuTmxjU0E5SUdaMWJtTjBhVzl1SUNndktpQm1kVzVqZEdsdmJuTXVMaTRnS2k4cElIdGNiaUFnSUNBZ0lDQWdkbUZ5SUdadWN5QTlJR0Z5WjNWdFpXNTBjenRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJRjl5WlhOMFVHRnlZVzBvWm5WdVkzUnBiMjRnS0dGeVozTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUIwYUdGMElEMGdkR2hwY3p0Y2JseHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHTmhiR3hpWVdOcklEMGdZWEpuYzF0aGNtZHpMbXhsYm1kMGFDQXRJREZkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hSNWNHVnZaaUJqWVd4c1ltRmpheUE5UFNBblpuVnVZM1JwYjI0bktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZWEpuY3k1d2IzQW9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzZ1BTQnViMjl3TzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUNBZ0lDQmhjM2x1WXk1eVpXUjFZMlVvWm01ekxDQmhjbWR6TENCbWRXNWpkR2x2YmlBb2JtVjNZWEpuY3l3Z1ptNHNJR05pS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1ptNHVZWEJ3Ykhrb2RHaGhkQ3dnYm1WM1lYSm5jeTVqYjI1allYUW9XMTl5WlhOMFVHRnlZVzBvWm5WdVkzUnBiMjRnS0dWeWNpd2dibVY0ZEdGeVozTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kySW9aWEp5TENCdVpYaDBZWEpuY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTbGRLU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlMRnh1SUNBZ0lDQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z0tHVnljaXdnY21WemRXeDBjeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yTG1Gd2NHeDVLSFJvWVhRc0lGdGxjbkpkTG1OdmJtTmhkQ2h5WlhOMWJIUnpLU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbU52YlhCdmMyVWdQU0JtZFc1amRHbHZiaUFvTHlvZ1puVnVZM1JwYjI1ekxpNHVJQ292S1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZeTV6WlhFdVlYQndiSGtvYm5Wc2JDd2dRWEp5WVhrdWNISnZkRzkwZVhCbExuSmxkbVZ5YzJVdVkyRnNiQ2hoY21kMWJXVnVkSE1wS1R0Y2JpQWdJQ0I5TzF4dVhHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZllYQndiSGxGWVdOb0tHVmhZMmhtYmlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1gzSmxjM1JRWVhKaGJTaG1kVzVqZEdsdmJpaG1ibk1zSUdGeVozTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJuYnlBOUlGOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNG9ZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUIwYUdGMElEMGdkR2hwY3p0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllYSWdZMkZzYkdKaFkyc2dQU0JoY21kekxuQnZjQ2dwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJsWVdOb1ptNG9abTV6TENCbWRXNWpkR2x2YmlBb1ptNHNJRjhzSUdOaUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdadUxtRndjR3g1S0hSb1lYUXNJR0Z5WjNNdVkyOXVZMkYwS0Z0allsMHBLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dGeVozTXViR1Z1WjNSb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHZHZMbUZ3Y0d4NUtIUm9hWE1zSUdGeVozTXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHZHZPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQmhjM2x1WXk1aGNIQnNlVVZoWTJnZ1BTQmZZWEJ3YkhsRllXTm9LR0Z6ZVc1akxtVmhZMmhQWmlrN1hHNGdJQ0FnWVhONWJtTXVZWEJ3YkhsRllXTm9VMlZ5YVdWeklEMGdYMkZ3Y0d4NVJXRmphQ2hoYzNsdVl5NWxZV05vVDJaVFpYSnBaWE1wTzF4dVhHNWNiaUFnSUNCaGMzbHVZeTVtYjNKbGRtVnlJRDBnWm5WdVkzUnBiMjRnS0dadUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ1pHOXVaU0E5SUc5dWJIbGZiMjVqWlNoallXeHNZbUZqYXlCOGZDQnViMjl3S1R0Y2JpQWdJQ0FnSUNBZ2RtRnlJSFJoYzJzZ1BTQmxibk4xY21WQmMzbHVZeWhtYmlrN1hHNGdJQ0FnSUNBZ0lHWjFibU4wYVc5dUlHNWxlSFFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9aWEp5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdSdmJtVW9aWEp5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIUmhjMnNvYm1WNGRDazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnYm1WNGRDZ3BPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmxibk4xY21WQmMzbHVZeWhtYmlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1gzSmxjM1JRWVhKaGJTaG1kVzVqZEdsdmJpQW9ZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHTmhiR3hpWVdOcklEMGdZWEpuY3k1d2IzQW9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHRnlaM011Y0hWemFDaG1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlHbHVibVZ5UVhKbmN5QTlJR0Z5WjNWdFpXNTBjenRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2MzbHVZeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmhjM2x1WXk1elpYUkpiVzFsWkdsaGRHVW9ablZ1WTNScGIyNGdLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnN1WVhCd2JIa29iblZzYkN3Z2FXNXVaWEpCY21kektUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc3VZWEJ3Ykhrb2JuVnNiQ3dnYVc1dVpYSkJjbWR6S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCemVXNWpJRDBnZEhKMVpUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdadUxtRndjR3g1S0hSb2FYTXNJR0Z5WjNNcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYzNsdVl5QTlJR1poYkhObE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQmhjM2x1WXk1bGJuTjFjbVZCYzNsdVl5QTlJR1Z1YzNWeVpVRnplVzVqTzF4dVhHNGdJQ0FnWVhONWJtTXVZMjl1YzNSaGJuUWdQU0JmY21WemRGQmhjbUZ0S0daMWJtTjBhVzl1S0haaGJIVmxjeWtnZTF4dUlDQWdJQ0FnSUNCMllYSWdZWEpuY3lBOUlGdHVkV3hzWFM1amIyNWpZWFFvZG1Gc2RXVnpLVHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJQ2hqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHTmhiR3hpWVdOckxtRndjR3g1S0hSb2FYTXNJR0Z5WjNNcE8xeHVJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lIMHBPMXh1WEc0Z0lDQWdZWE41Ym1NdWQzSmhjRk41Ym1NZ1BWeHVJQ0FnSUdGemVXNWpMbUZ6ZVc1amFXWjVJRDBnWm5WdVkzUnBiMjRnWVhONWJtTnBabmtvWm5WdVl5a2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdYM0psYzNSUVlYSmhiU2htZFc1amRHbHZiaUFvWVhKbmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR05oYkd4aVlXTnJJRDBnWVhKbmN5NXdiM0FvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCeVpYTjFiSFE3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjBjbmtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGMzVnNkQ0E5SUdaMWJtTXVZWEJ3Ykhrb2RHaHBjeXdnWVhKbmN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUlHTmhkR05vSUNobEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHTmhiR3hpWVdOcktHVXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z2FXWWdjbVZ6ZFd4MElHbHpJRkJ5YjIxcGMyVWdiMkpxWldOMFhHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1gybHpUMkpxWldOMEtISmxjM1ZzZENrZ0ppWWdkSGx3Wlc5bUlISmxjM1ZzZEM1MGFHVnVJRDA5UFNCY0ltWjFibU4wYVc5dVhDSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMWJIUXVkR2hsYmlobWRXNWpkR2x2YmloMllXeDFaU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aHVkV3hzTENCMllXeDFaU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNsYlhDSmpZWFJqYUZ3aVhTaG1kVzVqZEdsdmJpaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc29aWEp5TG0xbGMzTmhaMlVnUHlCbGNuSWdPaUJ1WlhjZ1JYSnliM0lvWlhKeUtTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHNTFiR3dzSUhKbGMzVnNkQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0F2THlCT2IyUmxMbXB6WEc0Z0lDQWdhV1lnS0hSNWNHVnZaaUJ0YjJSMWJHVWdQVDA5SUNkdlltcGxZM1FuSUNZbUlHMXZaSFZzWlM1bGVIQnZjblJ6S1NCN1hHNGdJQ0FnSUNBZ0lHMXZaSFZzWlM1bGVIQnZjblJ6SUQwZ1lYTjVibU03WEc0Z0lDQWdmVnh1SUNBZ0lDOHZJRUZOUkNBdklGSmxjWFZwY21WS1UxeHVJQ0FnSUdWc2MyVWdhV1lnS0hSNWNHVnZaaUJrWldacGJtVWdQVDA5SUNkbWRXNWpkR2x2YmljZ0ppWWdaR1ZtYVc1bExtRnRaQ2tnZTF4dUlDQWdJQ0FnSUNCa1pXWnBibVVvVzEwc0lHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZenRjYmlBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnZlZ4dUlDQWdJQzh2SUdsdVkyeDFaR1ZrSUdScGNtVmpkR3g1SUhacFlTQThjMk55YVhCMFBpQjBZV2RjYmlBZ0lDQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ2NtOXZkQzVoYzNsdVl5QTlJR0Z6ZVc1ak8xeHVJQ0FnSUgxY2JseHVmU2dwS1R0Y2JpSmRmUT09IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3MgPSB7XG5cdGxvZzogZnVuY3Rpb24gbG9nKHRleHQpIHtcblx0XHRjb25zb2xlLmxvZyh0ZXh0KTtcblx0fSxcblx0Z2V0OiBmdW5jdGlvbiBnZXQodXJsLCBjYWxsYmFjaykge1xuXHRcdHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuXHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcblx0XHRcdFx0aWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuXHRcdFx0XHRcdHZhciByZXNwb25zZSA9IHhoci5yZXNwb25zZSA/IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKSA6IG51bGw7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cywgcmVzcG9uc2UpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHhoci5zdGF0dXMgPCA1MDApIHtcblx0XHRcdFx0XHRjYWxsYmFjayh4aHIuc3RhdHVzKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdhamF4IGdldCBlcnJvcicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR4aHIub3BlbignR0VUJywgdXJsKTtcblx0XHR4aHIuc2VuZCgpO1xuXHR9LFxuXHRwb3N0OiBmdW5jdGlvbiBwb3N0KHVybCwgZGF0YSwgY2FsbGJhY2spIHtcblx0XHR2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cblx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlID09PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG5cdFx0XHRcdGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcblx0XHRcdFx0XHR2YXIgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2UgPyBKU09OLnBhcnNlKHhoci5yZXNwb25zZSkgOiBudWxsO1xuXHRcdFx0XHRcdGNhbGxiYWNrKHhoci5zdGF0dXMsIHJlc3BvbnNlKTtcblx0XHRcdFx0fSBlbHNlIGlmICh4aHIuc3RhdHVzIDwgNTAwKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignYWpheCBwb3N0IGVycm9yJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdHhoci5vcGVuKCdQT1NUJywgdXJsKTtcblx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblx0XHR4aHIuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cdH0sXG5cdGNvb2tpZTogZnVuY3Rpb24gY29va2llKG5hbWUsIGNvb2tpZXMpIHtcblx0XHR2YXIgYyA9IHRoaXMuY29va2llcyhjb29raWVzKTtcblx0XHRyZXR1cm4gY1tuYW1lXTtcblx0fSxcblx0Y29va2llczogZnVuY3Rpb24gY29va2llcyhfY29va2llcykge1xuXHRcdHZhciBuYW1lVmFsdWVzID0gX2Nvb2tpZXMuc3BsaXQoJzsgJyk7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdG5hbWVWYWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIGkgPSBpdGVtLnNwbGl0KCc9Jyk7XG5cdFx0XHRyZXN1bHRbaVswXV0gPSBpWzFdO1xuXHRcdH0pO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdGdldFF1ZXJ5VmFsdWU6IGZ1bmN0aW9uIGdldFF1ZXJ5VmFsdWUocXVlcnlTdHJpbmcsIG5hbWUpIHtcblx0XHR2YXIgYXJyID0gcXVlcnlTdHJpbmcubWF0Y2gobmV3IFJlZ0V4cChuYW1lICsgJz0oW14mXSspJykpO1xuXG5cdFx0aWYgKGFycikge1xuXHRcdFx0cmV0dXJuIGFyclsxXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgdGVzdHMgPSBbe1xuXHRpZDogMSxcblx0dGVzdDogZnVuY3Rpb24gdGVzdCgpIHtcblx0XHR2YXIgY29va2llcyA9IHtcblx0XHRcdGNzYXRpOiAnbWFqb20nLFxuXHRcdFx0b25lOiAndHdvJ1xuXHRcdH07XG5cblx0XHR2YXIgcmVzdWx0ID0gdHJ1ZTtcblxuXHRcdHZhciBjID0gY3MuY29va2llcygnY3NhdGk9bWFqb207IG9uZT10d28nKTtcblxuXHRcdGlmIChjLmNzYXRpICE9PSBjb29raWVzLmNzYXRpKSByZXN1bHQgPSBmYWxzZTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cbn0sIHtcblx0aWQ6IDIsXG5cdHRlc3Q6IGZ1bmN0aW9uIHRlc3QoKSB7XG5cdFx0cmV0dXJuICdiYXInID09PSBjcy5jb29raWUoJ2ZvbycsICdmb289YmFyOyB0ZT1tYWpvbScpO1xuXHR9XG59LCB7XG5cdGlkOiAzLFxuXHR0ZXN0OiBmdW5jdGlvbiB0ZXN0KCkge1xuXHRcdHJldHVybiAnMTIzJyA9PT0gY3MuZ2V0UXVlcnlWYWx1ZSgnP2NzYXRpPW1ham9tJnVzZXJfaWQ9MTIzJnZhbGFtaT1zZW1taScsICd1c2VyX2lkJyk7XG5cdH1cbn1dO1xuXG5pZiAoZmFsc2UpIHtcblx0dmFyIHJlc3VsdCA9IHRydWU7XG5cdHRlc3RzLmZvckVhY2goZnVuY3Rpb24gKHRlc3QpIHtcblx0XHRpZiAoIXRlc3QudGVzdCgpKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKHRlc3QuaWQgKyAnLiB0ZXN0IGZhaWxlZCcpO1xuXHRcdFx0cmVzdWx0ID0gZmFsc2U7XG5cdFx0fVxuXHR9KTtcblx0aWYgKHJlc3VsdCkge1xuXHRcdGNvbnNvbGUubG9nKCdBbGwgdGVzdHMgc3VjY2VlZGVkIScpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3M7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZm9vZCA9IHtcblx0Y2xpZW50OiB7XG5cdFx0dHlwZTogJ29iamVjdCcsXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0aWQ6IHsgdHlwZTogJ2ludGVnZXInIH0sXG5cdFx0XHRuYW1lOiB7IHR5cGU6ICdzdHJpbmcnLCBtaW5MZW5ndGg6IDMgfSxcblx0XHRcdGRlc2NyaXB0aW9uOiB7IHR5cGU6ICdzdHJpbmcnLCBtaW5MZW5ndGg6IDMgfSxcblx0XHRcdGNhdGVnb3J5OiB7IHR5cGU6ICdzdHJpbmcnLCBtaW5MZW5ndGg6IDEgfSxcblx0XHRcdHBhbGVvOiB7IHR5cGU6ICdpbnRlZ2VyJywgZXE6IFsxLCA1LCAxMF0gfSxcblx0XHRcdGtldG86IHsgdHlwZTogJ2ludGVnZXInLCBlcTogWzEsIDUsIDEwXSB9LFxuXHRcdFx0ZW5hYmxlZDogeyB0eXBlOiAnYm9vbGVhbicgfVxuXHRcdH1cblx0fVxufTtcblxudmFyIHdpc2ggPSB7XG5cdGJsYW5rOiBmdW5jdGlvbiBibGFuayh1c2VyKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHVzZXI6IHVzZXIsXG5cdFx0XHR0aXRsZTogJycsXG5cdFx0XHRkZXNjcmlwdGlvbjogJycsXG5cdFx0XHRkaXJ0eTogdHJ1ZVxuXHRcdH07XG5cdH0sXG5cdGNsaWVudDoge1xuXHRcdHR5cGU6ICdvYmplY3QnLFxuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdGlkOiB7IHR5cGU6IFsnc3RyaW5nJywgJ251bGwnXSwgb3B0aW9uYWw6IHRydWUgfSxcblx0XHRcdHRpdGxlOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG5cdFx0XHRkZXNjcmlwdGlvbjogeyB0eXBlOiAnc3RyaW5nJyB9LFxuXHRcdFx0dXNlcjoge1xuXHRcdFx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRcdFx0cHJvcGVydGllczoge1xuXHRcdFx0XHRcdGlkOiB7IHRweWU6ICdzdHJpbmcnIH0sXG5cdFx0XHRcdFx0bmFtZTogeyB0eXBlOiAnc3RyaW5nJyB9XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRkaXJ0eTogeyB0eXBlOiAnYm9vbGVhbicgfVxuXHRcdH1cblx0fSxcblx0c2VydmVyOiB7XG5cdFx0dHlwZTogJ29iamVjdCcsXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0aWQ6IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdHRpdGxlOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG5cdFx0XHRkZXNjcmlwdGlvbjogeyB0eXBlOiAnc3RyaW5nJyB9LFxuXHRcdFx0dXNlcjoge1xuXHRcdFx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRcdFx0cHJvcGVydGllczoge1xuXHRcdFx0XHRcdGlkOiB7IHRweWU6ICdzdHJpbmcnIH0sXG5cdFx0XHRcdFx0bmFtZTogeyB0eXBlOiAnc3RyaW5nJyB9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGNsaWVudFRvU2VydmVyOiBmdW5jdGlvbiBjbGllbnRUb1NlcnZlcihvYmopIHtcblx0XHR2YXIgd2lzaCA9IHtcblx0XHRcdHVzZXI6IG9iai51c2VyLFxuXHRcdFx0ZGVzY3JpcHRpb246IG9iai5kZXNjcmlwdGlvbixcblx0XHRcdHRpdGxlOiBvYmoudGl0bGVcblx0XHR9O1xuXHRcdGlmIChvYmouaWQpIHdpc2guaWQgPSBvYmouaWQ7XG5cdFx0cmV0dXJuIHdpc2g7XG5cdH0sXG5cdHNlcnZlclRvQ2xpZW50OiBmdW5jdGlvbiBzZXJ2ZXJUb0NsaWVudChvYmopIHtcblx0XHRvYmouZGlydHkgPSBmYWxzZTtcblx0XHRyZXR1cm4gXy5jbG9uZShvYmopO1xuXHR9XG59O1xuXG52YXIgd2lzaExpc3QgPSB7XG5cdHNlcnZlcjoge1xuXHRcdHR5cGU6ICdhcnJheScsXG5cdFx0aXRlbXM6IHtcblx0XHRcdHR5cGU6ICdvYmplY3QnLFxuXHRcdFx0cHJvcGVydGllczogd2lzaC5zZXJ2ZXIucHJvcGVydGllc1xuXHRcdH1cblx0fVxufTtcblxudmFyIHVzZXIgPSB7XG5cdGJsYW5rOiBmdW5jdGlvbiBibGFuaygpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aWQ6IG51bGwsXG5cdFx0XHRuYW1lOiAnJyxcblx0XHRcdHN0YXR1czogYmVsbGEuY29uc3RhbnRzLnVzZXJTdGF0dXMuR1VFU1Rcblx0XHR9O1xuXHR9LFxuXHRjbGllbnQ6IHtcblx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRpZDogeyB0eXBlOiBbJ3N0cmluZycsICdudWxsJ10sIG9wdGlvbmFsOiB0cnVlIH0sXG5cdFx0XHRuYW1lOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG5cdFx0XHRzdGF0dXM6IHsgdHlwZTogJ3N0cmluZycsIGVxOiBfLnZhbHVlcyhiZWxsYS5jb25zdGFudHMudXNlclN0YXR1cykgfVxuXHRcdH1cblx0fSxcblx0c2VydmVyOiB7XG5cdFx0dHlwZTogJ29iamVjdCcsXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0aWQ6IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdG5hbWU6IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdHN0YXR1czogeyB0eXBlOiAnc3RyaW5nJywgZXE6IF8udmFsdWVzKGJlbGxhLmNvbnN0YW50cy51c2VyU3RhdHVzKSB9XG5cdFx0fVxuXHR9LFxuXHRjbGllbnRUb1NlcnZlcjogZnVuY3Rpb24gY2xpZW50VG9TZXJ2ZXIob2JqKSB7fSxcblx0c2VydmVyVG9DbGllbnQ6IGZ1bmN0aW9uIHNlcnZlclRvQ2xpZW50KG9iaikge31cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR3aXNoOiB3aXNoLFxuXHR3aXNoTGlzdDogd2lzaExpc3QsXG5cdHVzZXI6IHVzZXIsXG5cdGZvb2Q6IGZvb2Rcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3MgPSByZXF1aXJlKCcuL2hlbHBlcnMvY3MnKTtcbnZhciBpbnNwZWN0b3IgPSByZXF1aXJlKCdzY2hlbWEtaW5zcGVjdG9yJyk7XG52YXIgc2NoZW1hcyA9IHJlcXVpcmUoJy4vc2NoZW1hcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0d2lzaDoge1xuXHRcdGdldDogZnVuY3Rpb24gZ2V0KGlkLCBjYWxsYmFjaykge1xuXHRcdFx0Y3MuZ2V0KCcvd2lzaD9pZD0nICsgaWQsIGZ1bmN0aW9uIChzdGF0dXMsIHdpc2gpIHtcblx0XHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSB7XG5cdFx0XHRcdFx0dmFyIHZhbGlkYXRpb24gPSBpbnNwZWN0b3IudmFsaWRhdGUoc2NoZW1hcy53aXNoLnNlcnZlciwgd2lzaCk7XG5cdFx0XHRcdFx0aWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCd3aXNoIHZhbGlkYXRpb24gZXJyb3InLCB2YWxpZGF0aW9uLmZvcm1hdCgpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiB0cnVlIH0sIHNjaGVtYXMud2lzaC5zZXJ2ZXJUb0NsaWVudCh3aXNoKSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuTk9UX0ZPVU5EKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogJ1dpc2ggbm90IGZvdW5kJyB9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRwb3N0OiBmdW5jdGlvbiBwb3N0KHdpc2gsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgdmFsaWRhdGlvbiA9IGluc3BlY3Rvci52YWxpZGF0ZShzY2hlbWFzLndpc2guY2xpZW50LCB3aXNoKTtcblx0XHRcdGlmICh2YWxpZGF0aW9uLnZhbGlkKSB7XG5cdFx0XHRcdGNzLnBvc3QoJy93aXNoJywgc2NoZW1hcy53aXNoLmNsaWVudFRvU2VydmVyKHdpc2gpLCBmdW5jdGlvbiAoc3RhdHVzKSB7XG5cdFx0XHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSBjYWxsYmFjayh7IHN1Y2Nlc3M6IHRydWUgfSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0d2lzaExpc3Q6IHtcblx0XHRnZXQ6IGZ1bmN0aW9uIGdldChjYWxsYmFjaykge1xuXHRcdFx0Y3MuZ2V0KCcvd2lzaExpc3QnLCBmdW5jdGlvbiAoc3RhdHVzLCB3aXNoTGlzdCkge1xuXHRcdFx0XHRpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuT0spIHtcblx0XHRcdFx0XHR2YXIgdmFsaWRhdGlvbiA9IGluc3BlY3Rvci52YWxpZGF0ZShzY2hlbWFzLndpc2hMaXN0LnNlcnZlciwgd2lzaExpc3QpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCd2YWlsZGF0aW9uJywgdmFsaWRhdGlvbik7XG5cdFx0XHRcdFx0aWYgKCF2YWxpZGF0aW9uLnZhbGlkKSBjb25zb2xlLmVycm9yKCd3aXNoTGlzdCBzZXJ2ZXIgdmFsaWRhdGlvbiBlcnJvcicpO1xuXHRcdFx0XHRcdGNhbGxiYWNrKHsgc3VjY2VzczogdHJ1ZSB9LCB3aXNoTGlzdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignd2lzaExpc3QgYWpheCBlcnJvcicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdHVzZXJTdGF0dXM6IHtcblx0XHRnZXQ6IGZ1bmN0aW9uIGdldChjYWxsYmFjaykge1xuXHRcdFx0Y3MuZ2V0KCcvdXNlclN0YXR1cycsIGZ1bmN0aW9uIChzdGF0dXMsIHVzZXJTdGF0dXMpIHtcblx0XHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiB0cnVlIH0sIHVzZXJTdGF0dXMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdGxvZ2luOiBmdW5jdGlvbiBsb2dpbihsb2dpbkRhdGEsIGNhbGxiYWNrKSB7XG5cdFx0Y3MucG9zdCgnL2xvZ2luJywgbG9naW5EYXRhLCBmdW5jdGlvbiAoc3RhdHVzLCB1c2VyKSB7XG5cdFx0XHRpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuT0spIHtcblx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiB0cnVlIH0sIHVzZXIpO1xuXHRcdFx0fSBlbHNlIGlmIChzdGF0dXMgPT09IGJlbGxhLmNvbnN0YW50cy5yZXNwb25zZS5OT1RfRk9VTkQpIHtcblx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiBmYWxzZSB9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0bG9nb3V0OiBmdW5jdGlvbiBsb2dvdXQoY2FsbGJhY2spIHtcblx0XHRjcy5nZXQoJ2xvZ291dCcsIGZ1bmN0aW9uIChzdGF0dXMpIHtcblx0XHRcdGlmIChzdGF0dXMgPT09IGJlbGxhLmNvbnN0YW50cy5yZXNwb25zZS5PSykge1xuXHRcdFx0XHRjYWxsYmFjayh7IHN1Y2Nlc3M6IHRydWUgfSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGZvb2Q6IHtcblx0XHRnZXQ6IGZ1bmN0aW9uIGdldChjYXRlZ29yeUlkLCBjYWxsYmFjaykge1xuXHRcdFx0Y3MuZ2V0KCcvZm9vZHMvJyArIGNhdGVnb3J5SWQsIGZ1bmN0aW9uIChzdGF0dXMsIGZvb2RzKSB7fSk7XG5cdFx0fSxcblx0XHRwb3N0OiBmdW5jdGlvbiBwb3N0KGZvb2QsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgdmFsaWRhdGlvbiA9IGluc3BlY3Rvci52YWxpZGF0ZShzY2hlbWFzLmZvb2QuY2xpZW50LCBmb29kKTtcblxuXHRcdFx0aWYgKHZhbGlkYXRpb24udmFsaWQpIHtcblx0XHRcdFx0Y3MucG9zdCgnL2Zvb2QnLCBmb29kLCBmdW5jdGlvbiAoc3RhdHVzLCBmb29kKSB7XG5cdFx0XHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSB7XG5cdFx0XHRcdFx0XHRjYWxsYmFjayh0cnVlLCBudWxsLCBmb29kKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y2FsbGJhY2soZmFsc2UsIFt7IHByb3BlcnR5OiAnc2VydmVyJywgbWVzc2FnZTogJ2Vycm9yJyB9XSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNhbGxiYWNrKHZhbGlkYXRpb24udmFsaWQsIHZhbGlkYXRpb24uZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTsiXX0=
