(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

window.DEBUG_MODE = false;
var nutrients = require('../../nutrients');
var cs = require('../../helpers/cs');
var server = require('../../server');
var foodShort = require('../../food').short;

var HomePage = React.createClass({
	displayName: 'HomePage',

	getInitialState: function getInitialState() {
		return {
			status: 'init',
			foods: []
		};
	},
	render: function render() {
		var _this = this;

		var list;

		switch (this.state.status) {
			case 'init':
				list = React.createElement(
					'tr',
					null,
					React.createElement(
						'td',
						null,
						'Select a food category!'
					)
				);
				break;
			case 'loading':
				list = React.createElement(
					'tr',
					null,
					React.createElement(
						'td',
						null,
						'Loading...'
					)
				);
				break;
			case 'ready':
				list = _.map(this.state.foods, function (food, key) {
					var buttons, name, description, category, paleoOptions, ketoOptions, enabled;

					if (_this.state.selectedFoodId) {
						if (_this.state.selectedFoodId === food.id) {
							buttons = React.createElement(
								'div',
								null,
								React.createElement(
									'button',
									{ onClick: _this.save },
									'Save'
								),
								React.createElement(
									'button',
									{ onClick: _this.cancel },
									'Cancel'
								)
							);

							category = React.createElement(
								'select',
								{ ref: 'categorySelect', defaultValue: food.category },
								React.createElement(
									'option',
									{ value: '' },
									'choose one...'
								),
								getCategoryOptions()
							);

							paleoOptions = React.createElement(
								'select',
								{ ref: 'paleoSelect', defaultValue: food.paleo },
								getPaleoKetoOptions(food.paleo)
							);

							ketoOptions = React.createElement(
								'select',
								{ ref: 'ketoSelect', defaultValue: food.keto },
								getPaleoKetoOptions(food.keto)
							);

							name = React.createElement('input', { type: 'text', ref: 'nameInput', defaultValue: food.name });
							description = React.createElement('input', { type: 'text', ref: 'descriptionInput', defaultValue: food.description });
							enabled = React.createElement('input', {
								type: 'checkbox',
								defaultChecked: food.enabled,
								ref: 'enabledCheckbox' });
						} else {
							buttons = React.createElement('div', null);
							category = React.createElement(
								'span',
								null,
								_.find(foodShort, function (short) {
									return short[0] === food.category;
								})
							);
							paleoOptions = React.createElement(
								'span',
								null,
								food.paleo
							);
							ketoOptions = React.createElement(
								'span',
								null,
								food.keto
							);
							name = React.createElement(
								'span',
								null,
								food.name
							);
							description = React.createElement(
								'span',
								null,
								food.description
							);
							enabled = React.createElement('input', {
								type: 'checkbox',
								defaultChecked: food.enabled,
								disabled: true });
						}
					} else {
						buttons = React.createElement(
							'div',
							null,
							React.createElement(
								'button',
								{ onClick: _this.editFood.bind(_this, food.id) },
								'Edit'
							)
						);
						category = React.createElement(
							'span',
							null,
							_.find(foodShort, function (short) {
								return short[0] === food.category;
							})
						);
						paleoOptions = React.createElement(
							'span',
							null,
							food.paleo
						);
						ketoOptions = React.createElement(
							'span',
							null,
							food.keto
						);
						name = React.createElement(
							'span',
							null,
							food.name
						);
						description = React.createElement(
							'span',
							null,
							food.description
						);
						enabled = React.createElement('input', {
							type: 'checkbox',
							defaultChecked: food.enabled,
							disabled: true });
					}

					return React.createElement(
						'tr',
						{ key: key },
						React.createElement(
							'td',
							null,
							food.original_name
						),
						React.createElement(
							'td',
							null,
							name
						),
						React.createElement(
							'td',
							null,
							description
						),
						React.createElement(
							'td',
							null,
							category
						),
						React.createElement(
							'td',
							null,
							paleoOptions
						),
						React.createElement(
							'td',
							null,
							ketoOptions
						),
						React.createElement(
							'td',
							null,
							enabled
						),
						React.createElement(
							'td',
							null,
							buttons
						)
					);
				});
				break;
		}

		function getFoodGroupOptions() {
			return _.map(nutrients.foodGroups, function (foodGroup, key) {
				return React.createElement(
					'option',
					{ key: foodGroup, value: foodGroup },
					key
				);
			});
		}

		function getPaleoKetoOptions() {
			return _.map([10, 5, 1], function (value) {
				return React.createElement(
					'option',
					{ key: value, value: value },
					value
				);
			});
		}

		function getCategoryOptions() {
			return _.map(foodShort, function (food, key) {
				return React.createElement(
					'option',
					{ key: key, value: food[0] },
					food[0] + '\t' + food[1]
				);
			});
		}

		return React.createElement(
			'div',
			{ className: 'bc-home-page' },
			React.createElement(
				'select',
				{ onChange: this.selectFoodGroupChange },
				React.createElement(
					'option',
					{ value: '0' },
					'...'
				),
				getFoodGroupOptions()
			),
			React.createElement(
				'table',
				null,
				React.createElement(
					'thead',
					null,
					React.createElement(
						'tr',
						null,
						React.createElement(
							'th',
							null,
							'originalName'
						),
						React.createElement(
							'th',
							null,
							'name'
						),
						React.createElement(
							'th',
							null,
							'description'
						),
						React.createElement(
							'th',
							null,
							'category'
						),
						React.createElement(
							'th',
							null,
							'paleo'
						),
						React.createElement(
							'th',
							null,
							'keto'
						),
						React.createElement(
							'th',
							null,
							'enabled'
						),
						React.createElement('th', null)
					)
				),
				React.createElement(
					'tbody',
					null,
					list
				)
			)
		);
	},
	selectFoodGroupChange: function selectFoodGroupChange(e) {
		this.getNutrientData(e.target.value);
		this.setState({
			status: 'loading',
			selectedFoodId: false,
			selectedFoodGroupId: e.target.value
		});
	},
	editFood: function editFood(id) {
		this.setState({ selectedFoodId: id });
	},
	save: function save() {
		var _this2 = this;

		//this.setState({ status: 'loading' });
		var food = {
			id: this.state.selectedFoodId,
			name: this.refs.nameInput.value,
			description: this.refs.descriptionInput.value,
			category: this.refs.categorySelect.value,
			paleo: parseInt(this.refs.paleoSelect.value),
			keto: parseInt(this.refs.ketoSelect.value),
			enabled: this.refs.enabledCheckbox.checked
		};
		server.food.post(food, function (valid, error) {
			if (valid) {
				var foods = _.clone(_this2.state.foods);
				var editedFood = _.find(foods, function (f) {
					return food.id === f.id;
				});
				_.merge(editedFood, food);
				_this2.setState({
					selectedFoodId: false,
					status: 'ready',
					foods: foods
				});
			} else {
				var message = 'Error! \n';
				_.each(error, function (e) {
					return message += e.property + ': ' + e.message + '\n';
				});
				alert(message);
				_this2.setState({ status: 'ready' });
			}
		});
	},
	cancel: function cancel() {
		this.setState({ selectedFoodId: false });
	},
	getNutrientData: function getNutrientData(foodGroup) {
		var _this3 = this;

		cs.get('/foods/' + foodGroup, function (status, foods) {
			_this3.setState({ status: 'ready', foods: foods });
		});
	}
});

ReactDOM.render(React.createElement(HomePage, null), document.getElementById('main-section'));
},{"../../food":6,"../../helpers/cs":7,"../../nutrients":8,"../../server":10}],2:[function(require,module,exports){
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

var short = [['1.1', 'grain based baked'], ['1.2', 'grain free baked'], ['2.1.1', 'beer'], ['2.1.2', 'distilled'], ['2.1.3', 'liquor'], ['2.1.4', 'wine'], ['2', 'cereal grains and pasta'], ['4.1', 'dairy'], ['4.2', 'egg'], ['5', 'fats and oils'], ['6', 'fish and shellfish'], ['7', 'fruit and juices'], ['8', 'legumes'], ['9.1', 'beef'], ['9.2', 'pork'], ['9.3.1', 'chicken'], ['9.3.2', 'turkey'], ['9.3.3', 'duck'], ['9.3.4', 'goose'], ['9.4', 'lamb'], ['9.5', 'game'], ['10', 'nuts and seeds'], ['11', 'spices and herbs'], ['12', 'vegetables']];

var categories = {
    1: {
        name: 'baked products',
        sub: {
            1: {
                name: 'grain based baked products',
                paleo: false
            },
            2: {
                name: 'grain free baked products'
            }
        }
    },
    2: {
        name: 'beverages',
        sub: {
            1: {
                name: 'alcoholic',
                paleo: false,
                sub: {
                    1: {
                        name: 'beer'
                    },
                    2: {
                        name: 'distilled'
                    },
                    3: {
                        name: 'liquor'
                    },
                    4: {
                        name: 'wine'
                    }
                }
            },
            2: {
                name: 'coffee'
            },
            3: {
                name: 'tea'
            }
        }
    },
    3: {
        name: 'cereal grains and pasta',
        paleo: false
    },
    4: {
        name: 'dairy and egg',
        sub: {
            1: {
                name: 'dairy',
                paleo: false
            },
            2: {
                name: 'egg'
            }
        }
    },
    5: {
        name: 'fats and oils'
    },
    6: {
        name: 'fish and shellfish'
    },
    7: {
        name: 'fruits and juices'
    },
    8: {
        name: 'legumes',
        paleo: false
    },
    9: {
        name: 'meat',
        sub: {
            1: {
                name: 'beef'
            },
            2: {
                name: 'pork'
            },
            3: {
                name: 'poultry',
                sub: {
                    1: {
                        name: 'chicken'
                    },
                    2: {
                        name: 'turkey'
                    },
                    3: {
                        name: 'duck'
                    },
                    4: {
                        name: 'goose'
                    }
                }
            },
            4: {
                name: 'lamb'
            },
            5: {
                name: 'game'
            }
        }
    },
    10: {
        name: 'nuts and seeds'
    },
    11: {
        name: 'spices and herbs'
    },
    12: {
        name: 'vegetables'
    }
};

module.exports = {
    categories: categories,
    short: short
};
},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
'use strict';

var nutrients = {
	'energy': '208',
	'protein': '203',
	'fat': '204',
	'carbohydrate': '205',
	'fiber': '291',
	'sugar': '269',
	'Ca': '301',
	'Fe': '303',
	'Mg': '304',
	'P': '305',
	'K': '306',
	'Na': '307',
	'Zn': '309',
	'Cu': '312',
	'Mn': '315',
	'Se': '317',
	'F': '313',
	'v_a': '318',
	'v_b6': '415',
	'v_b12': '418',
	'v_c': '401',
	'v_d3': '326',
	'v_e': '323',
	'v_k': '430',
	'fatty_acids_total_saturated': '606',
	'fatty_acids_total_monounsaturated': '645',
	'fatty_acids_total_polyunsaturated': '646',
	'fatty_acids_total_trans': '605',
	'DPA': '631',
	'DHA': '621',
	'cholesterol': '601',
	'alcohol_ethyl': '221',
	'caffeine': '262'
};

var foodGroups = {
	'egg': '1',
	'spices_and_herbs': '2',
	'baby_foods': '3',
	'fats_and_oils': '4',
	'poultry': '5',
	'soups_sauces_and_gravies': '6',
	'sausages_and_luncheon_meats': '7',
	'breakfast_cereals': '8',
	'fruits_and_fruit_juices': '9',
	'pork': '10',
	'vegetables': '11',
	'nuts_and_seeds': '12',
	'beef': '13',
	'beverages': '14',
	'fish_and_shellfish': '15',
	'legumes': '16',
	'lamb_veal_and_game': '17',
	'baked_products': '18',
	'sweets': '19',
	'cereal_grains_and_pasta': '20',
	'fast_foods': '21',
	'meals_entrees_and_side_dishes': '22'
};

module.exports = {
	nutrients: nutrients,
	foodGroups: foodGroups,
	apiKey: 'PYza6j5W6M2Cq863svJxiz1p8qV2qoGCgGf0SyH4'
};
},{}],9:[function(require,module,exports){
'use strict';

var food = {
	client: {
		type: 'object',
		properties: {
			id: { type: 'integer' },
			name: { type: 'string', minLength: 3 },
			description: { type: 'string' },
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
},{}],10:[function(require,module,exports){
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
				cs.post('/food', food, function (status) {
					if (status === bella.constants.response.OK) {
						callback(true, null);
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
},{"./helpers/cs":7,"./schemas":9,"schema-inspector":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjL3NjcmlwdHMvY29tcG9uZW50cy9ob21lX3BhZ2UvaG9tZV9wYWdlLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9zY2hlbWEtaW5zcGVjdG9yL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3NjaGVtYS1pbnNwZWN0b3IvbGliL3NjaGVtYS1pbnNwZWN0b3IuanMiLCJub2RlX21vZHVsZXMvc2NoZW1hLWluc3BlY3Rvci9ub2RlX21vZHVsZXMvYXN5bmMvbGliL2FzeW5jLmpzIiwic3JjL3NjcmlwdHMvZm9vZC5qcyIsInNyYy9zY3JpcHRzL2hlbHBlcnMvY3MuanMiLCJzcmMvc2NyaXB0cy9udXRyaWVudHMuanMiLCJzcmMvc2NyaXB0cy9zY2hlbWFzLmpzIiwic3JjL3NjcmlwdHMvc2VydmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4WEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxREE7QUFDQTs7QUNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdGlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcHZDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMzSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbndpbmRvdy5ERUJVR19NT0RFID0gZmFsc2U7XG52YXIgbnV0cmllbnRzID0gcmVxdWlyZSgnLi4vLi4vbnV0cmllbnRzJyk7XG52YXIgY3MgPSByZXF1aXJlKCcuLi8uLi9oZWxwZXJzL2NzJyk7XG52YXIgc2VydmVyID0gcmVxdWlyZSgnLi4vLi4vc2VydmVyJyk7XG52YXIgZm9vZFNob3J0ID0gcmVxdWlyZSgnLi4vLi4vZm9vZCcpLnNob3J0O1xuXG52YXIgSG9tZVBhZ2UgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnSG9tZVBhZ2UnLFxuXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRzdGF0dXM6ICdpbml0Jyxcblx0XHRcdGZvb2RzOiBbXVxuXHRcdH07XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHR2YXIgbGlzdDtcblxuXHRcdHN3aXRjaCAodGhpcy5zdGF0ZS5zdGF0dXMpIHtcblx0XHRcdGNhc2UgJ2luaXQnOlxuXHRcdFx0XHRsaXN0ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQndHInLFxuXHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0J1NlbGVjdCBhIGZvb2QgY2F0ZWdvcnkhJ1xuXHRcdFx0XHRcdClcblx0XHRcdFx0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdsb2FkaW5nJzpcblx0XHRcdFx0bGlzdCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J3RyJyxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHQndGQnLFxuXHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdCdMb2FkaW5nLi4uJ1xuXHRcdFx0XHRcdClcblx0XHRcdFx0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdyZWFkeSc6XG5cdFx0XHRcdGxpc3QgPSBfLm1hcCh0aGlzLnN0YXRlLmZvb2RzLCBmdW5jdGlvbiAoZm9vZCwga2V5KSB7XG5cdFx0XHRcdFx0dmFyIGJ1dHRvbnMsIG5hbWUsIGRlc2NyaXB0aW9uLCBjYXRlZ29yeSwgcGFsZW9PcHRpb25zLCBrZXRvT3B0aW9ucywgZW5hYmxlZDtcblxuXHRcdFx0XHRcdGlmIChfdGhpcy5zdGF0ZS5zZWxlY3RlZEZvb2RJZCkge1xuXHRcdFx0XHRcdFx0aWYgKF90aGlzLnN0YXRlLnNlbGVjdGVkRm9vZElkID09PSBmb29kLmlkKSB7XG5cdFx0XHRcdFx0XHRcdGJ1dHRvbnMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHRcdCdidXR0b24nLFxuXHRcdFx0XHRcdFx0XHRcdFx0eyBvbkNsaWNrOiBfdGhpcy5zYXZlIH0sXG5cdFx0XHRcdFx0XHRcdFx0XHQnU2F2ZSdcblx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdFx0XHQnYnV0dG9uJyxcblx0XHRcdFx0XHRcdFx0XHRcdHsgb25DbGljazogX3RoaXMuY2FuY2VsIH0sXG5cdFx0XHRcdFx0XHRcdFx0XHQnQ2FuY2VsJ1xuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdFx0XHRjYXRlZ29yeSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdFx0J3NlbGVjdCcsXG5cdFx0XHRcdFx0XHRcdFx0eyByZWY6ICdjYXRlZ29yeVNlbGVjdCcsIGRlZmF1bHRWYWx1ZTogZm9vZC5jYXRlZ29yeSB9LFxuXHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdFx0XHQnb3B0aW9uJyxcblx0XHRcdFx0XHRcdFx0XHRcdHsgdmFsdWU6ICcnIH0sXG5cdFx0XHRcdFx0XHRcdFx0XHQnY2hvb3NlIG9uZS4uLidcblx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRcdGdldENhdGVnb3J5T3B0aW9ucygpXG5cdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0cGFsZW9PcHRpb25zID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHQnc2VsZWN0Jyxcblx0XHRcdFx0XHRcdFx0XHR7IHJlZjogJ3BhbGVvU2VsZWN0JywgZGVmYXVsdFZhbHVlOiBmb29kLnBhbGVvIH0sXG5cdFx0XHRcdFx0XHRcdFx0Z2V0UGFsZW9LZXRvT3B0aW9ucyhmb29kLnBhbGVvKVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdGtldG9PcHRpb25zID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHQnc2VsZWN0Jyxcblx0XHRcdFx0XHRcdFx0XHR7IHJlZjogJ2tldG9TZWxlY3QnLCBkZWZhdWx0VmFsdWU6IGZvb2Qua2V0byB9LFxuXHRcdFx0XHRcdFx0XHRcdGdldFBhbGVvS2V0b09wdGlvbnMoZm9vZC5rZXRvKVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdG5hbWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHsgdHlwZTogJ3RleHQnLCByZWY6ICduYW1lSW5wdXQnLCBkZWZhdWx0VmFsdWU6IGZvb2QubmFtZSB9KTtcblx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb24gPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHsgdHlwZTogJ3RleHQnLCByZWY6ICdkZXNjcmlwdGlvbklucHV0JywgZGVmYXVsdFZhbHVlOiBmb29kLmRlc2NyaXB0aW9uIH0pO1xuXHRcdFx0XHRcdFx0XHRlbmFibGVkID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7XG5cdFx0XHRcdFx0XHRcdFx0dHlwZTogJ2NoZWNrYm94Jyxcblx0XHRcdFx0XHRcdFx0XHRkZWZhdWx0Q2hlY2tlZDogZm9vZC5lbmFibGVkLFxuXHRcdFx0XHRcdFx0XHRcdHJlZjogJ2VuYWJsZWRDaGVja2JveCcgfSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRidXR0b25zID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnZGl2JywgbnVsbCk7XG5cdFx0XHRcdFx0XHRcdGNhdGVnb3J5ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRfLmZpbmQoZm9vZFNob3J0LCBmdW5jdGlvbiAoc2hvcnQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBzaG9ydFswXSA9PT0gZm9vZC5jYXRlZ29yeTtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRwYWxlb09wdGlvbnMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHRcdCdzcGFuJyxcblx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdGZvb2QucGFsZW9cblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0a2V0b09wdGlvbnMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHRcdCdzcGFuJyxcblx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdGZvb2Qua2V0b1xuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRuYW1lID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRmb29kLm5hbWVcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb24gPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHRcdCdzcGFuJyxcblx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdGZvb2QuZGVzY3JpcHRpb25cblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0ZW5hYmxlZCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xuXHRcdFx0XHRcdFx0XHRcdHR5cGU6ICdjaGVja2JveCcsXG5cdFx0XHRcdFx0XHRcdFx0ZGVmYXVsdENoZWNrZWQ6IGZvb2QuZW5hYmxlZCxcblx0XHRcdFx0XHRcdFx0XHRkaXNhYmxlZDogdHJ1ZSB9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YnV0dG9ucyA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHRcdCdidXR0b24nLFxuXHRcdFx0XHRcdFx0XHRcdHsgb25DbGljazogX3RoaXMuZWRpdEZvb2QuYmluZChfdGhpcywgZm9vZC5pZCkgfSxcblx0XHRcdFx0XHRcdFx0XHQnRWRpdCdcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGNhdGVnb3J5ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRfLmZpbmQoZm9vZFNob3J0LCBmdW5jdGlvbiAoc2hvcnQpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2hvcnRbMF0gPT09IGZvb2QuY2F0ZWdvcnk7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cGFsZW9PcHRpb25zID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRmb29kLnBhbGVvXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0a2V0b09wdGlvbnMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGZvb2Qua2V0b1xuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdG5hbWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGZvb2QubmFtZVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRmb29kLmRlc2NyaXB0aW9uXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0ZW5hYmxlZCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0Jywge1xuXHRcdFx0XHRcdFx0XHR0eXBlOiAnY2hlY2tib3gnLFxuXHRcdFx0XHRcdFx0XHRkZWZhdWx0Q2hlY2tlZDogZm9vZC5lbmFibGVkLFxuXHRcdFx0XHRcdFx0XHRkaXNhYmxlZDogdHJ1ZSB9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdCd0cicsXG5cdFx0XHRcdFx0XHR7IGtleToga2V5IH0sXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGQnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRmb29kLm9yaWdpbmFsX25hbWVcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGQnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRuYW1lXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3RkJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb25cblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGQnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRjYXRlZ29yeVxuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdHBhbGVvT3B0aW9uc1xuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGtldG9PcHRpb25zXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3RkJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0ZW5hYmxlZFxuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGJ1dHRvbnNcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZ2V0Rm9vZEdyb3VwT3B0aW9ucygpIHtcblx0XHRcdHJldHVybiBfLm1hcChudXRyaWVudHMuZm9vZEdyb3VwcywgZnVuY3Rpb24gKGZvb2RHcm91cCwga2V5KSB7XG5cdFx0XHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdvcHRpb24nLFxuXHRcdFx0XHRcdHsga2V5OiBmb29kR3JvdXAsIHZhbHVlOiBmb29kR3JvdXAgfSxcblx0XHRcdFx0XHRrZXlcblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGdldFBhbGVvS2V0b09wdGlvbnMoKSB7XG5cdFx0XHRyZXR1cm4gXy5tYXAoWzEwLCA1LCAxXSwgZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdvcHRpb24nLFxuXHRcdFx0XHRcdHsga2V5OiB2YWx1ZSwgdmFsdWU6IHZhbHVlIH0sXG5cdFx0XHRcdFx0dmFsdWVcblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGdldENhdGVnb3J5T3B0aW9ucygpIHtcblx0XHRcdHJldHVybiBfLm1hcChmb29kU2hvcnQsIGZ1bmN0aW9uIChmb29kLCBrZXkpIHtcblx0XHRcdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J29wdGlvbicsXG5cdFx0XHRcdFx0eyBrZXk6IGtleSwgdmFsdWU6IGZvb2RbMF0gfSxcblx0XHRcdFx0XHRmb29kWzBdICsgJ1xcdCcgKyBmb29kWzFdXG5cdFx0XHRcdCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdiYy1ob21lLXBhZ2UnIH0sXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHQnc2VsZWN0Jyxcblx0XHRcdFx0eyBvbkNoYW5nZTogdGhpcy5zZWxlY3RGb29kR3JvdXBDaGFuZ2UgfSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQnb3B0aW9uJyxcblx0XHRcdFx0XHR7IHZhbHVlOiAnMCcgfSxcblx0XHRcdFx0XHQnLi4uJ1xuXHRcdFx0XHQpLFxuXHRcdFx0XHRnZXRGb29kR3JvdXBPcHRpb25zKClcblx0XHRcdCksXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHQndGFibGUnLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCd0aGVhZCcsXG5cdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0J3RyJyxcblx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGgnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHQnb3JpZ2luYWxOYW1lJ1xuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0aCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdCduYW1lJ1xuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0aCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdCdkZXNjcmlwdGlvbidcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGgnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHQnY2F0ZWdvcnknXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3RoJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0J3BhbGVvJ1xuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0aCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdCdrZXRvJ1xuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0aCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdCdlbmFibGVkJ1xuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3RoJywgbnVsbClcblx0XHRcdFx0XHQpXG5cdFx0XHRcdCksXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J3Rib2R5Jyxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdGxpc3Rcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdCk7XG5cdH0sXG5cdHNlbGVjdEZvb2RHcm91cENoYW5nZTogZnVuY3Rpb24gc2VsZWN0Rm9vZEdyb3VwQ2hhbmdlKGUpIHtcblx0XHR0aGlzLmdldE51dHJpZW50RGF0YShlLnRhcmdldC52YWx1ZSk7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRzdGF0dXM6ICdsb2FkaW5nJyxcblx0XHRcdHNlbGVjdGVkRm9vZElkOiBmYWxzZSxcblx0XHRcdHNlbGVjdGVkRm9vZEdyb3VwSWQ6IGUudGFyZ2V0LnZhbHVlXG5cdFx0fSk7XG5cdH0sXG5cdGVkaXRGb29kOiBmdW5jdGlvbiBlZGl0Rm9vZChpZCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBzZWxlY3RlZEZvb2RJZDogaWQgfSk7XG5cdH0sXG5cdHNhdmU6IGZ1bmN0aW9uIHNhdmUoKSB7XG5cdFx0dmFyIF90aGlzMiA9IHRoaXM7XG5cblx0XHQvL3RoaXMuc2V0U3RhdGUoeyBzdGF0dXM6ICdsb2FkaW5nJyB9KTtcblx0XHR2YXIgZm9vZCA9IHtcblx0XHRcdGlkOiB0aGlzLnN0YXRlLnNlbGVjdGVkRm9vZElkLFxuXHRcdFx0bmFtZTogdGhpcy5yZWZzLm5hbWVJbnB1dC52YWx1ZSxcblx0XHRcdGRlc2NyaXB0aW9uOiB0aGlzLnJlZnMuZGVzY3JpcHRpb25JbnB1dC52YWx1ZSxcblx0XHRcdGNhdGVnb3J5OiB0aGlzLnJlZnMuY2F0ZWdvcnlTZWxlY3QudmFsdWUsXG5cdFx0XHRwYWxlbzogcGFyc2VJbnQodGhpcy5yZWZzLnBhbGVvU2VsZWN0LnZhbHVlKSxcblx0XHRcdGtldG86IHBhcnNlSW50KHRoaXMucmVmcy5rZXRvU2VsZWN0LnZhbHVlKSxcblx0XHRcdGVuYWJsZWQ6IHRoaXMucmVmcy5lbmFibGVkQ2hlY2tib3guY2hlY2tlZFxuXHRcdH07XG5cdFx0c2VydmVyLmZvb2QucG9zdChmb29kLCBmdW5jdGlvbiAodmFsaWQsIGVycm9yKSB7XG5cdFx0XHRpZiAodmFsaWQpIHtcblx0XHRcdFx0dmFyIGZvb2RzID0gXy5jbG9uZShfdGhpczIuc3RhdGUuZm9vZHMpO1xuXHRcdFx0XHR2YXIgZWRpdGVkRm9vZCA9IF8uZmluZChmb29kcywgZnVuY3Rpb24gKGYpIHtcblx0XHRcdFx0XHRyZXR1cm4gZm9vZC5pZCA9PT0gZi5pZDtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdF8ubWVyZ2UoZWRpdGVkRm9vZCwgZm9vZCk7XG5cdFx0XHRcdF90aGlzMi5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0c2VsZWN0ZWRGb29kSWQ6IGZhbHNlLFxuXHRcdFx0XHRcdHN0YXR1czogJ3JlYWR5Jyxcblx0XHRcdFx0XHRmb29kczogZm9vZHNcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YXIgbWVzc2FnZSA9ICdFcnJvciEgXFxuJztcblx0XHRcdFx0Xy5lYWNoKGVycm9yLCBmdW5jdGlvbiAoZSkge1xuXHRcdFx0XHRcdHJldHVybiBtZXNzYWdlICs9IGUucHJvcGVydHkgKyAnOiAnICsgZS5tZXNzYWdlICsgJ1xcbic7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRhbGVydChtZXNzYWdlKTtcblx0XHRcdFx0X3RoaXMyLnNldFN0YXRlKHsgc3RhdHVzOiAncmVhZHknIH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRjYW5jZWw6IGZ1bmN0aW9uIGNhbmNlbCgpIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgc2VsZWN0ZWRGb29kSWQ6IGZhbHNlIH0pO1xuXHR9LFxuXHRnZXROdXRyaWVudERhdGE6IGZ1bmN0aW9uIGdldE51dHJpZW50RGF0YShmb29kR3JvdXApIHtcblx0XHR2YXIgX3RoaXMzID0gdGhpcztcblxuXHRcdGNzLmdldCgnL2Zvb2RzLycgKyBmb29kR3JvdXAsIGZ1bmN0aW9uIChzdGF0dXMsIGZvb2RzKSB7XG5cdFx0XHRfdGhpczMuc2V0U3RhdGUoeyBzdGF0dXM6ICdyZWFkeScsIGZvb2RzOiBmb29kcyB9KTtcblx0XHR9KTtcblx0fVxufSk7XG5cblJlYWN0RE9NLnJlbmRlcihSZWFjdC5jcmVhdGVFbGVtZW50KEhvbWVQYWdlLCBudWxsKSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4tc2VjdGlvbicpKTsiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IHRydWU7XG4gICAgdmFyIGN1cnJlbnRRdWV1ZTtcbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgdmFyIGkgPSAtMTtcbiAgICAgICAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgICAgICAgICAgY3VycmVudFF1ZXVlW2ldKCk7XG4gICAgICAgIH1cbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xufVxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICBxdWV1ZS5wdXNoKGZ1bik7XG4gICAgaWYgKCFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCcuL2xpYi9zY2hlbWEtaW5zcGVjdG9yJyk7XG4iLCIvKlxuICogVGhpcyBtb2R1bGUgaXMgaW50ZW5kZWQgdG8gYmUgZXhlY3V0ZWQgYm90aCBvbiBjbGllbnQgc2lkZSBhbmQgc2VydmVyIHNpZGUuXG4gKiBObyBlcnJvciBzaG91bGQgYmUgdGhyb3duLiAoc29mdCBlcnJvciBoYW5kbGluZylcbiAqL1xuXG4oZnVuY3Rpb24gKCkge1xuXHR2YXIgcm9vdCA9IHt9O1xuXHQvLyBEZXBlbmRlbmNpZXMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cblx0cm9vdC5hc3luYyA9ICh0eXBlb2YgcmVxdWlyZSA9PT0gJ2Z1bmN0aW9uJykgPyByZXF1aXJlKCdhc3luYycpIDogd2luZG93LmFzeW5jO1xuXHRpZiAodHlwZW9mIHJvb3QuYXN5bmMgIT09ICdvYmplY3QnKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKCdNb2R1bGUgYXN5bmMgaXMgcmVxdWlyZWQgKGh0dHBzOi8vZ2l0aHViLmNvbS9jYW9sYW4vYXN5bmMpJyk7XG5cdH1cblx0dmFyIGFzeW5jID0gcm9vdC5hc3luYztcblxuXHRmdW5jdGlvbiBfZXh0ZW5kKG9yaWdpbiwgYWRkKSB7XG5cdFx0aWYgKCFhZGQgfHwgdHlwZW9mIGFkZCAhPT0gJ29iamVjdCcpIHtcblx0XHRcdHJldHVybiBvcmlnaW47XG5cdFx0fVxuXHRcdHZhciBrZXlzID0gT2JqZWN0LmtleXMoYWRkKTtcblx0XHR2YXIgaSA9IGtleXMubGVuZ3RoO1xuXHRcdHdoaWxlIChpLS0pIHtcblx0XHRcdG9yaWdpbltrZXlzW2ldXSA9IGFkZFtrZXlzW2ldXTtcblx0XHR9XG5cdFx0cmV0dXJuIG9yaWdpbjtcblx0fVxuXG5cdGZ1bmN0aW9uIF9tZXJnZSgpIHtcblx0XHR2YXIgcmV0ID0ge307XG5cdFx0dmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpO1xuXHRcdHZhciBrZXlzID0gbnVsbDtcblx0XHR2YXIgaSA9IG51bGw7XG5cblx0XHRhcmdzLmZvckVhY2goZnVuY3Rpb24gKGFyZykge1xuXHRcdFx0aWYgKGFyZyAmJiBhcmcuY29uc3RydWN0b3IgPT09IE9iamVjdCkge1xuXHRcdFx0XHRrZXlzID0gT2JqZWN0LmtleXMoYXJnKTtcblx0XHRcdFx0aSA9IGtleXMubGVuZ3RoO1xuXHRcdFx0XHR3aGlsZSAoaS0tKSB7XG5cdFx0XHRcdFx0cmV0W2tleXNbaV1dID0gYXJnW2tleXNbaV1dO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHJldDtcblx0fVxuXG5cdC8vIEN1c3RvbWlzYWJsZSBjbGFzcyAoQmFzZSBjbGFzcykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBVc2Ugd2l0aCBvcGVyYXRpb24gXCJuZXdcIiB0byBleHRlbmQgVmFsaWRhdGlvbiBhbmQgU2FuaXRpemF0aW9uIHRoZW1zZWx2ZXMsXG5cdC8vIG5vdCB0aGVpciBwcm90b3R5cGUuIEluIG90aGVyIHdvcmRzLCBjb25zdHJ1Y3RvciBzaGFsbCBiZSBjYWxsIHRvIGV4dGVuZFxuXHQvLyB0aG9zZSBmdW5jdGlvbnMsIGluc3RlYWQgb2YgYmVpbmcgaW4gdGhlaXIgY29uc3RydWN0b3IsIGxpa2UgdGhpczpcblx0Ly9cdFx0X2V4dGVuZChWYWxpZGF0aW9uLCBuZXcgQ3VzdG9taXNhYmxlKTtcblxuXHRmdW5jdGlvbiBDdXN0b21pc2FibGUoKSB7XG5cdFx0dGhpcy5jdXN0b20gPSB7fTtcblxuXHRcdHRoaXMuZXh0ZW5kID0gZnVuY3Rpb24gKGN1c3RvbSkge1xuXHRcdFx0cmV0dXJuIF9leHRlbmQodGhpcy5jdXN0b20sIGN1c3RvbSk7XG5cdFx0fTtcblxuXHRcdHRoaXMucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHR0aGlzLmN1c3RvbSA9IHt9O1xuXHRcdH07XG5cblx0XHR0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uIChmaWVsZHMpIHtcblx0XHRcdGlmICghX3R5cGVJcy5hcnJheShmaWVsZHMpKSB7XG5cdFx0XHRcdGZpZWxkcyA9IFtmaWVsZHNdO1xuXHRcdFx0fVxuXHRcdFx0ZmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGZpZWxkKSB7XG5cdFx0XHRcdGRlbGV0ZSB0aGlzLmN1c3RvbVtmaWVsZF07XG5cdFx0XHR9LCB0aGlzKTtcblx0XHR9O1xuXHR9XG5cblx0Ly8gSW5zcGVjdGlvbiBjbGFzcyAoQmFzZSBjbGFzcykgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIFVzZSB0byBleHRlbmQgVmFsaWRhdGlvbiBhbmQgU2FuaXRpemF0aW9uIHByb3RvdHlwZXMuIEluc3BlY3Rpb25cblx0Ly8gY29uc3RydWN0b3Igc2hhbGwgYmUgY2FsbGVkIGluIGRlcml2ZWQgY2xhc3MgY29uc3RydWN0b3IuXG5cblx0ZnVuY3Rpb24gSW5zcGVjdGlvbihzY2hlbWEsIGN1c3RvbSkge1xuXHRcdHZhciBfc3RhY2sgPSBbJ0AnXTtcblxuXHRcdHRoaXMuX3NjaGVtYSA9IHNjaGVtYTtcblx0XHR0aGlzLl9jdXN0b20gPSB7fTtcblx0XHRpZiAoY3VzdG9tICE9IG51bGwpIHtcblx0XHRcdGZvciAodmFyIGtleSBpbiBjdXN0b20pIHtcblx0XHRcdFx0aWYgKGN1c3RvbS5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcblx0XHRcdFx0XHR0aGlzLl9jdXN0b21bJyQnICsga2V5XSA9IGN1c3RvbVtrZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5fZ2V0RGVwdGggPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gX3N0YWNrLmxlbmd0aDtcblx0XHR9O1xuXG5cdFx0dGhpcy5fZHVtcFN0YWNrID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIF9zdGFjay5tYXAoZnVuY3Rpb24gKGkpIHtyZXR1cm4gaS5yZXBsYWNlKC9eXFxbL2csICdcXDAzM1xcMDM0XFwwMzVcXDAzNicpO30pXG5cdFx0XHQuam9pbignLicpLnJlcGxhY2UoL1xcLlxcMDMzXFwwMzRcXDAzNVxcMDM2L2csICdbJyk7XG5cdFx0fTtcblxuXHRcdHRoaXMuX2RlZXBlck9iamVjdCA9IGZ1bmN0aW9uIChuYW1lKSB7XG5cdFx0XHRfc3RhY2sucHVzaCgoL15bYS16JF9dW2EtejAtOSRfXSokL2kpLnRlc3QobmFtZSkgPyBuYW1lIDogJ1tcIicgKyBuYW1lICsgJ1wiXScpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fTtcblxuXHRcdHRoaXMuX2RlZXBlckFycmF5ID0gZnVuY3Rpb24gKGkpIHtcblx0XHRcdF9zdGFjay5wdXNoKCdbJyArIGkgKyAnXScpO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fTtcblxuXHRcdHRoaXMuX2JhY2sgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRfc3RhY2sucG9wKCk7XG5cdFx0XHRyZXR1cm4gdGhpcztcblx0XHR9O1xuXHR9XG5cdC8vIFNpbXBsZSB0eXBlcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHQvLyBJZiB0aGUgcHJvcGVydHkgaXMgbm90IGRlZmluZWQgb3IgaXMgbm90IGluIHRoaXMgbGlzdDpcblx0dmFyIF90eXBlSXMgPSB7XG5cdFx0XCJmdW5jdGlvblwiOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIHR5cGVvZiBlbGVtZW50ID09PSAnZnVuY3Rpb24nO1xuXHRcdH0sXG5cdFx0XCJzdHJpbmdcIjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiB0eXBlb2YgZWxlbWVudCA9PT0gJ3N0cmluZyc7XG5cdFx0fSxcblx0XHRcIm51bWJlclwiOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIHR5cGVvZiBlbGVtZW50ID09PSAnbnVtYmVyJyAmJiAhaXNOYU4oZWxlbWVudCk7XG5cdFx0fSxcblx0XHRcImludGVnZXJcIjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiB0eXBlb2YgZWxlbWVudCA9PT0gJ251bWJlcicgJiYgZWxlbWVudCAlIDEgPT09IDA7XG5cdFx0fSxcblx0XHRcIk5hTlwiOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIHR5cGVvZiBlbGVtZW50ID09PSAnbnVtYmVyJyAmJiBpc05hTihlbGVtZW50KTtcblx0XHR9LFxuXHRcdFwiYm9vbGVhblwiOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIHR5cGVvZiBlbGVtZW50ID09PSAnYm9vbGVhbic7XG5cdFx0fSxcblx0XHRcIm51bGxcIjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiBlbGVtZW50ID09PSBudWxsO1xuXHRcdH0sXG5cdFx0XCJkYXRlXCI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gZWxlbWVudCAhPSBudWxsICYmIGVsZW1lbnQgaW5zdGFuY2VvZiBEYXRlO1xuXHRcdH0sXG5cdFx0XCJvYmplY3RcIjogZnVuY3Rpb24gKGVsZW1lbnQpIHtcblx0XHRcdHJldHVybiBlbGVtZW50ICE9IG51bGwgJiYgZWxlbWVudC5jb25zdHJ1Y3RvciA9PT0gT2JqZWN0O1xuXHRcdH0sXG5cdFx0XCJhcnJheVwiOiBmdW5jdGlvbiAoZWxlbWVudCkge1xuXHRcdFx0cmV0dXJuIGVsZW1lbnQgIT0gbnVsbCAmJiBlbGVtZW50LmNvbnN0cnVjdG9yID09PSBBcnJheTtcblx0XHR9LFxuXHRcdFwiYW55XCI6IGZ1bmN0aW9uIChlbGVtZW50KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH07XG5cblx0ZnVuY3Rpb24gX3NpbXBsZVR5cGUodHlwZSwgY2FuZGlkYXRlKSB7XG5cdFx0aWYgKHR5cGVvZiB0eXBlID09ICdmdW5jdGlvbicpIHtcblx0XHRcdHJldHVybiBjYW5kaWRhdGUgaW5zdGFuY2VvZiB0eXBlO1xuXHRcdH1cblx0XHR0eXBlID0gdHlwZSBpbiBfdHlwZUlzID8gdHlwZSA6ICdhbnknO1xuXHRcdHJldHVybiBfdHlwZUlzW3R5cGVdKGNhbmRpZGF0ZSk7XG5cdH1cblxuXHRmdW5jdGlvbiBfcmVhbFR5cGUoY2FuZGlkYXRlKSB7XG5cdFx0Zm9yICh2YXIgaSBpbiBfdHlwZUlzKSB7XG5cdFx0XHRpZiAoX3NpbXBsZVR5cGUoaSwgY2FuZGlkYXRlKSkge1xuXHRcdFx0XHRpZiAoaSAhPT0gJ2FueScpIHsgcmV0dXJuIGk7IH1cblx0XHRcdFx0cmV0dXJuICdhbiBpbnN0YW5jZSBvZiAnICsgY2FuZGlkYXRlLmNvbnN0cnVjdG9yLm5hbWU7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0SW5kZXhlcyhhLCB2YWx1ZSkge1xuXHRcdHZhciBpbmRleGVzID0gW107XG5cdFx0dmFyIGkgPSBhLmluZGV4T2YodmFsdWUpO1xuXG5cdFx0d2hpbGUgKGkgIT09IC0xKSB7XG5cdFx0XHRpbmRleGVzLnB1c2goaSk7XG5cdFx0XHRpID0gYS5pbmRleE9mKHZhbHVlLCBpICsgMSk7XG5cdFx0fVxuXHRcdHJldHVybiBpbmRleGVzO1xuXHR9XG5cblx0Ly8gQXZhaWxhYmxlIGZvcm1hdHMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdHZhciBfZm9ybWF0cyA9IHtcblx0XHQndm9pZCc6IC9eJC8sXG5cdFx0J3VybCc6IC9eKGh0dHBzP3xmdHApOlxcL1xcLygoKChbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6KSpAKT8oKChcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSlcXC4oXFxkfFsxLTldXFxkfDFcXGRcXGR8MlswLTRdXFxkfDI1WzAtNV0pXFwuKFxcZHxbMS05XVxcZHwxXFxkXFxkfDJbMC00XVxcZHwyNVswLTVdKVxcLihcXGR8WzEtOV1cXGR8MVxcZFxcZHwyWzAtNF1cXGR8MjVbMC01XSkpfCgoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4pPygoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLj8pKDpcXGQqKT8pKFxcLygoKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCglW1xcZGEtZl17Mn0pfFshXFwkJidcXChcXClcXCpcXCssOz1dfDp8QCkrKFxcLygoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKSopKik/KT8oXFw/KCgoW2Etel18XFxkfC18XFwufF98fnxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KCVbXFxkYS1mXXsyfSl8WyFcXCQmJ1xcKFxcKVxcKlxcKyw7PV18OnxAKXxbXFx1RTAwMC1cXHVGOEZGXXxcXC98XFw/KSopPyhcXCMoKChbYS16XXxcXGR8LXxcXC58X3x+fFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoJVtcXGRhLWZdezJ9KXxbIVxcJCYnXFwoXFwpXFwqXFwrLDs9XXw6fEApfFxcL3xcXD8pKik/JC9pLFxuXHRcdCdkYXRlLXRpbWUnOiAvXlxcZHs0fS1cXGR7Mn0tXFxkezJ9VFxcZHsyfTpcXGR7Mn06XFxkezJ9KFxcLlxcZHszfSk/KFo/fCgtfFxcKylcXGR7Mn06XFxkezJ9KSQvLFxuXHRcdCdkYXRlJzogL15cXGR7NH0tXFxkezJ9LVxcZHsyfSQvLFxuXHRcdCdjb29sRGF0ZVRpbWUnOiAvXlxcZHs0fSgtfFxcLylcXGR7Mn0oLXxcXC8pXFxkezJ9KFR8IClcXGR7Mn06XFxkezJ9OlxcZHsyfShcXC5cXGR7M30pP1o/JC8sXG5cdFx0J3RpbWUnOiAvXlxcZHsyfVxcOlxcZHsyfVxcOlxcZHsyfSQvLFxuXHRcdCdjb2xvcic6IC9eIyhbMC05YS1mXSkrJC9pLFxuXHRcdCdlbWFpbCc6IC9eKCgoW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKyhcXC4oW2Etel18XFxkfFshI1xcJCUmJ1xcKlxcK1xcLVxcLz1cXD9cXF5fYHtcXHx9fl18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKykqKXwoKFxceDIyKSgoKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KChbXFx4MDEtXFx4MDhcXHgwYlxceDBjXFx4MGUtXFx4MWZcXHg3Zl18XFx4MjF8W1xceDIzLVxceDViXXxbXFx4NWQtXFx4N2VdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKXwoXFxcXChbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGQtXFx4N2ZdfFtcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkpKSooKChcXHgyMHxcXHgwOSkqKFxceDBkXFx4MGEpKT8oXFx4MjB8XFx4MDkpKyk/KFxceDIyKSkpQCgoKFthLXpdfFxcZHxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSl8KChbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxcXGR8W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKSlcXC4pKygoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pfCgoW2Etel18W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKFthLXpdfFxcZHwtfFxcLnxffH58W1xcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pKihbYS16XXxbXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXSkpKVxcLj8kL2ksXG5cdFx0J251bWVyaWMnOiAvXlswLTldKyQvLFxuXHRcdCdpbnRlZ2VyJzogL15cXC0/WzAtOV0rJC8sXG5cdFx0J2RlY2ltYWwnOiAvXlxcLT9bMC05XSpcXC4/WzAtOV0rJC8sXG5cdFx0J2FscGhhJzogL15bYS16XSskL2ksXG5cdFx0J2FscGhhTnVtZXJpYyc6IC9eW2EtejAtOV0rJC9pLFxuXHRcdCdhbHBoYURhc2gnOiAvXlthLXowLTlfLV0rJC9pLFxuXHRcdCdqYXZhc2NyaXB0JzogL15bYS16X1xcJF1bYS16MC05X1xcJF0qJC9pLFxuXHRcdCd1cHBlclN0cmluZyc6IC9eW0EtWiBdKiQvLFxuXHRcdCdsb3dlclN0cmluZyc6IC9eW2EteiBdKiQvXG5cdH07XG5cbi8vIFZhbGlkYXRpb24gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdHZhciBfdmFsaWRhdGlvbkF0dHJpYnV0ID0ge1xuXHRcdG9wdGlvbmFsOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdHZhciBvcHQgPSB0eXBlb2Ygc2NoZW1hLm9wdGlvbmFsID09PSAnYm9vbGVhbicgPyBzY2hlbWEub3B0aW9uYWwgOiAoc2NoZW1hLm9wdGlvbmFsID09PSAndHJ1ZScpOyAvLyBEZWZhdWx0IGlzIGZhbHNlXG5cblx0XHRcdGlmIChvcHQgPT09IHRydWUpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHR5cGVvZiBjYW5kaWRhdGUgPT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCdpcyBtaXNzaW5nIGFuZCBub3Qgb3B0aW9uYWwnKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHR5cGU6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0Ly8gcmV0dXJuIGJlY2F1c2Ugb3B0aW9uYWwgZnVuY3Rpb24gYWxyZWFkeSBoYW5kbGUgdGhpcyBjYXNlXG5cdFx0XHRpZiAodHlwZW9mIGNhbmRpZGF0ZSA9PT0gJ3VuZGVmaW5lZCcgfHwgKHR5cGVvZiBzY2hlbWEudHlwZSAhPT0gJ3N0cmluZycgJiYgIShzY2hlbWEudHlwZSBpbnN0YW5jZW9mIEFycmF5KSAmJiB0eXBlb2Ygc2NoZW1hLnR5cGUgIT09ICdmdW5jdGlvbicpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciB0eXBlcyA9IF90eXBlSXMuYXJyYXkoc2NoZW1hLnR5cGUpID8gc2NoZW1hLnR5cGUgOiBbc2NoZW1hLnR5cGVdO1xuXHRcdFx0dmFyIHR5cGVJc1ZhbGlkID0gdHlwZXMuc29tZShmdW5jdGlvbiAodHlwZSkge1xuXHRcdFx0XHRyZXR1cm4gX3NpbXBsZVR5cGUodHlwZSwgY2FuZGlkYXRlKTtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKCF0eXBlSXNWYWxpZCkge1xuXHRcdFx0XHR0eXBlcyA9IHR5cGVzLm1hcChmdW5jdGlvbiAodCkge3JldHVybiB0eXBlb2YgdCA9PT0gJ2Z1bmN0aW9uJyA/ICdhbmQgaW5zdGFuY2Ugb2YgJyArIHQubmFtZSA6IHQ7IH0pO1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBiZSAnICsgdHlwZXMuam9pbignIG9yICcpICsgJywgYnV0IGlzICcgKyBfcmVhbFR5cGUoY2FuZGlkYXRlKSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR1bmlxdWVuZXNzOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hLnVuaXF1ZW5lc3MgPT09ICdzdHJpbmcnKSB7IHNjaGVtYS51bmlxdWVuZXNzID0gKHNjaGVtYS51bmlxdWVuZXNzID09PSAndHJ1ZScpOyB9XG5cdFx0XHRpZiAodHlwZW9mIHNjaGVtYS51bmlxdWVuZXNzICE9PSAnYm9vbGVhbicgfHwgc2NoZW1hLnVuaXF1ZW5lc3MgPT09IGZhbHNlIHx8ICghX3R5cGVJcy5hcnJheShjYW5kaWRhdGUpICYmIHR5cGVvZiBjYW5kaWRhdGUgIT09ICdzdHJpbmcnKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgcmVwb3J0ZWQgPSBbXTtcblx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgY2FuZGlkYXRlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChyZXBvcnRlZC5pbmRleE9mKGNhbmRpZGF0ZVtpXSkgPj0gMCkge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHZhciBpbmRleGVzID0gZ2V0SW5kZXhlcyhjYW5kaWRhdGUsIGNhbmRpZGF0ZVtpXSk7XG5cdFx0XHRcdGlmIChpbmRleGVzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRyZXBvcnRlZC5wdXNoKGNhbmRpZGF0ZVtpXSk7XG5cdFx0XHRcdFx0dGhpcy5yZXBvcnQoJ2hhcyB2YWx1ZSBbJyArIGNhbmRpZGF0ZVtpXSArICddIG1vcmUgdGhhbiBvbmNlIGF0IGluZGV4ZXMgWycgKyBpbmRleGVzLmpvaW4oJywgJykgKyAnXScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRwYXR0ZXJuOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdHZhciByZWdleHMgPSBzY2hlbWEucGF0dGVybjtcblx0XHRcdGlmICh0eXBlb2YgY2FuZGlkYXRlICE9PSAnc3RyaW5nJykge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgbWF0Y2hlcyA9IGZhbHNlO1xuXHRcdFx0aWYgKCFfdHlwZUlzLmFycmF5KHJlZ2V4cykpIHtcblx0XHRcdFx0cmVnZXhzID0gW3JlZ2V4c107XG5cdFx0XHR9XG5cdFx0XHRyZWdleHMuZm9yRWFjaChmdW5jdGlvbiAocmVnZXgpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiByZWdleCA9PT0gJ3N0cmluZycgJiYgcmVnZXggaW4gX2Zvcm1hdHMpIHtcblx0XHRcdFx0XHRyZWdleCA9IF9mb3JtYXRzW3JlZ2V4XTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmVnZXggaW5zdGFuY2VvZiBSZWdFeHApIHtcblx0XHRcdFx0XHRpZiAocmVnZXgudGVzdChjYW5kaWRhdGUpKSB7XG5cdFx0XHRcdFx0XHRtYXRjaGVzID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0aWYgKCFtYXRjaGVzKSB7XG5cdFx0XHRcdHNlbGYucmVwb3J0KCdtdXN0IG1hdGNoIFsnICsgcmVnZXhzLmpvaW4oJyBvciAnKSArICddLCBidXQgaXMgZXF1YWwgdG8gXCInICsgY2FuZGlkYXRlICsgJ1wiJyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHR2YWxpZERhdGU6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0aWYgKFN0cmluZyhzY2hlbWEudmFsaWREYXRlKSA9PT0gJ3RydWUnICYmIGNhbmRpZGF0ZSBpbnN0YW5jZW9mIERhdGUgJiYgaXNOYU4oY2FuZGlkYXRlLmdldFRpbWUoKSkpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3QgYmUgYSB2YWxpZCBkYXRlJyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRtaW5MZW5ndGg6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0aWYgKHR5cGVvZiBjYW5kaWRhdGUgIT09ICdzdHJpbmcnICYmICFfdHlwZUlzLmFycmF5KGNhbmRpZGF0ZSkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIG1pbkxlbmd0aCA9IE51bWJlcihzY2hlbWEubWluTGVuZ3RoKTtcblx0XHRcdGlmIChpc05hTihtaW5MZW5ndGgpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGlmIChjYW5kaWRhdGUubGVuZ3RoIDwgbWluTGVuZ3RoKSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IGJlIGxvbmdlciB0aGFuICcgKyBtaW5MZW5ndGggKyAnIGVsZW1lbnRzLCBidXQgaXQgaGFzICcgKyBjYW5kaWRhdGUubGVuZ3RoKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdG1heExlbmd0aDogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ3N0cmluZycgJiYgIV90eXBlSXMuYXJyYXkoY2FuZGlkYXRlKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgbWF4TGVuZ3RoID0gTnVtYmVyKHNjaGVtYS5tYXhMZW5ndGgpO1xuXHRcdFx0aWYgKGlzTmFOKG1heExlbmd0aCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGNhbmRpZGF0ZS5sZW5ndGggPiBtYXhMZW5ndGgpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3QgYmUgc2hvcnRlciB0aGFuICcgKyBtYXhMZW5ndGggKyAnIGVsZW1lbnRzLCBidXQgaXQgaGFzICcgKyBjYW5kaWRhdGUubGVuZ3RoKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGV4YWN0TGVuZ3RoOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdGlmICh0eXBlb2YgY2FuZGlkYXRlICE9PSAnc3RyaW5nJyAmJiAhX3R5cGVJcy5hcnJheShjYW5kaWRhdGUpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBleGFjdExlbmd0aCA9IE51bWJlcihzY2hlbWEuZXhhY3RMZW5ndGgpO1xuXHRcdFx0aWYgKGlzTmFOKGV4YWN0TGVuZ3RoKSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoY2FuZGlkYXRlLmxlbmd0aCAhPT0gZXhhY3RMZW5ndGgpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3QgaGF2ZSBleGFjdGx5ICcgKyBleGFjdExlbmd0aCArICcgZWxlbWVudHMsIGJ1dCBpdCBoYXZlICcgKyBjYW5kaWRhdGUubGVuZ3RoKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGx0OiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdHZhciBsaW1pdCA9IE51bWJlcihzY2hlbWEubHQpO1xuXHRcdFx0aWYgKHR5cGVvZiBjYW5kaWRhdGUgIT09ICdudW1iZXInIHx8IGlzTmFOKGxpbWl0KSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoY2FuZGlkYXRlID49IGxpbWl0KSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IGJlIGxlc3MgdGhhbiAnICsgbGltaXQgKyAnLCBidXQgaXMgZXF1YWwgdG8gXCInICsgY2FuZGlkYXRlICsgJ1wiJyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRsdGU6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0dmFyIGxpbWl0ID0gTnVtYmVyKHNjaGVtYS5sdGUpO1xuXHRcdFx0aWYgKHR5cGVvZiBjYW5kaWRhdGUgIT09ICdudW1iZXInIHx8IGlzTmFOKGxpbWl0KSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoY2FuZGlkYXRlID4gbGltaXQpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3QgYmUgbGVzcyB0aGFuIG9yIGVxdWFsIHRvICcgKyBsaW1pdCArICcsIGJ1dCBpcyBlcXVhbCB0byBcIicgKyBjYW5kaWRhdGUgKyAnXCInKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGd0OiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdHZhciBsaW1pdCA9IE51bWJlcihzY2hlbWEuZ3QpO1xuXHRcdFx0aWYgKHR5cGVvZiBjYW5kaWRhdGUgIT09ICdudW1iZXInIHx8IGlzTmFOKGxpbWl0KSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoY2FuZGlkYXRlIDw9IGxpbWl0KSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IGJlIGdyZWF0ZXIgdGhhbiAnICsgbGltaXQgKyAnLCBidXQgaXMgZXF1YWwgdG8gXCInICsgY2FuZGlkYXRlICsgJ1wiJyk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRndGU6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSkge1xuXHRcdFx0dmFyIGxpbWl0ID0gTnVtYmVyKHNjaGVtYS5ndGUpO1xuXHRcdFx0aWYgKHR5cGVvZiBjYW5kaWRhdGUgIT09ICdudW1iZXInIHx8IGlzTmFOKGxpbWl0KSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAoY2FuZGlkYXRlIDwgbGltaXQpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3QgYmUgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvICcgKyBsaW1pdCArICcsIGJ1dCBpcyBlcXVhbCB0byBcIicgKyBjYW5kaWRhdGUgKyAnXCInKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGVxOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdGlmICh0eXBlb2YgY2FuZGlkYXRlICE9PSAnbnVtYmVyJyAmJiB0eXBlb2YgY2FuZGlkYXRlICE9PSAnc3RyaW5nJyAmJiB0eXBlb2YgY2FuZGlkYXRlICE9PSAnYm9vbGVhbicpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGxpbWl0ID0gc2NoZW1hLmVxO1xuXHRcdFx0aWYgKHR5cGVvZiBsaW1pdCAhPT0gJ251bWJlcicgJiYgdHlwZW9mIGxpbWl0ICE9PSAnc3RyaW5nJyAmJiB0eXBlb2YgbGltaXQgIT09ICdib29sZWFuJyAmJiAhX3R5cGVJcy5hcnJheShsaW1pdCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKF90eXBlSXMuYXJyYXkobGltaXQpKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGltaXQubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRpZiAoY2FuZGlkYXRlID09PSBsaW1pdFtpXSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBiZSBlcXVhbCB0byBbJyArIGxpbWl0Lm1hcChmdW5jdGlvbiAobCkge1xuXHRcdFx0XHRcdHJldHVybiAnXCInICsgbCArICdcIic7XG5cdFx0XHRcdH0pLmpvaW4oJyBvciAnKSArICddLCBidXQgaXMgZXF1YWwgdG8gXCInICsgY2FuZGlkYXRlICsgJ1wiJyk7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYgKGNhbmRpZGF0ZSAhPT0gbGltaXQpIHtcblx0XHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBiZSBlcXVhbCB0byBcIicgKyBsaW1pdCArICdcIiwgYnV0IGlzIGVxdWFsIHRvIFwiJyArIGNhbmRpZGF0ZSArICdcIicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRuZTogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ251bWJlcicgJiYgdHlwZW9mIGNhbmRpZGF0ZSAhPT0gJ3N0cmluZycpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGxpbWl0ID0gc2NoZW1hLm5lO1xuXHRcdFx0aWYgKHR5cGVvZiBsaW1pdCAhPT0gJ251bWJlcicgJiYgdHlwZW9mIGxpbWl0ICE9PSAnc3RyaW5nJyAmJiAhX3R5cGVJcy5hcnJheShsaW1pdCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKF90eXBlSXMuYXJyYXkobGltaXQpKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgbGltaXQubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRpZiAoY2FuZGlkYXRlID09PSBsaW1pdFtpXSkge1xuXHRcdFx0XHRcdFx0dGhpcy5yZXBvcnQoJ211c3Qgbm90IGJlIGVxdWFsIHRvIFwiJyArIGxpbWl0W2ldICsgJ1wiJyk7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0aWYgKGNhbmRpZGF0ZSA9PT0gbGltaXQpIHtcblx0XHRcdFx0XHR0aGlzLnJlcG9ydCgnbXVzdCBub3QgYmUgZXF1YWwgdG8gXCInICsgbGltaXQgKyAnXCInKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0c29tZUtleXM6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0KSB7XG5cdFx0XHR2YXIgX2tleXMgPSBzY2hlbWEuc29tZUtleXM7XG5cdFx0XHRpZiAoIV90eXBlSXMub2JqZWN0KGNhbmRpZGF0KSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgdmFsaWQgPSBfa2V5cy5zb21lKGZ1bmN0aW9uIChhY3Rpb24pIHtcblx0XHRcdFx0cmV0dXJuIChhY3Rpb24gaW4gY2FuZGlkYXQpO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoIXZhbGlkKSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCdtdXN0IGhhdmUgYXQgbGVhc3Qga2V5ICcgKyBfa2V5cy5tYXAoZnVuY3Rpb24gKGkpIHtcblx0XHRcdFx0XHRyZXR1cm4gJ1wiJyArIGkgKyAnXCInO1xuXHRcdFx0XHR9KS5qb2luKCcgb3IgJykpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0c3RyaWN0OiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUpIHtcblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hLnN0cmljdCA9PT0gJ3N0cmluZycpIHsgc2NoZW1hLnN0cmljdCA9IChzY2hlbWEuc3RyaWN0ID09PSAndHJ1ZScpOyB9XG5cdFx0XHRpZiAoc2NoZW1hLnN0cmljdCAhPT0gdHJ1ZSB8fCAhX3R5cGVJcy5vYmplY3QoY2FuZGlkYXRlKSB8fCAhX3R5cGVJcy5vYmplY3Qoc2NoZW1hLnByb3BlcnRpZXMpKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hLnByb3BlcnRpZXNbJyonXSA9PT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0dmFyIGludHJ1ZGVyID0gT2JqZWN0LmtleXMoY2FuZGlkYXRlKS5maWx0ZXIoZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRcdHJldHVybiAodHlwZW9mIHNjaGVtYS5wcm9wZXJ0aWVzW2tleV0gPT09ICd1bmRlZmluZWQnKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChpbnRydWRlci5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0dmFyIG1zZyA9ICdzaG91bGQgbm90IGNvbnRhaW5zICcgKyAoaW50cnVkZXIubGVuZ3RoID4gMSA/ICdwcm9wZXJ0aWVzJyA6ICdwcm9wZXJ0eScpICtcblx0XHRcdFx0XHRcdCcgWycgKyBpbnRydWRlci5tYXAoZnVuY3Rpb24gKGkpIHsgcmV0dXJuICdcIicgKyBpICsgJ1wiJzsgfSkuam9pbignLCAnKSArICddJztcblx0XHRcdFx0XHRzZWxmLnJlcG9ydChtc2cpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRleGVjOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cblx0XHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuYXN5bmNFeGVjKHNjaGVtYSwgY2FuZGlkYXRlLCBjYWxsYmFjayk7XG5cdFx0XHR9XG5cdFx0XHQoX3R5cGVJcy5hcnJheShzY2hlbWEuZXhlYykgPyBzY2hlbWEuZXhlYyA6IFtzY2hlbWEuZXhlY10pLmZvckVhY2goZnVuY3Rpb24gKGV4ZWMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBleGVjID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0ZXhlYy5jYWxsKHNlbGYsIHNjaGVtYSwgY2FuZGlkYXRlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRwcm9wZXJ0aWVzOiBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLmFzeW5jUHJvcGVydGllcyhzY2hlbWEsIGNhbmRpZGF0ZSwgY2FsbGJhY2spO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCEoc2NoZW1hLnByb3BlcnRpZXMgaW5zdGFuY2VvZiBPYmplY3QpIHx8ICEoY2FuZGlkYXRlIGluc3RhbmNlb2YgT2JqZWN0KSkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHR2YXIgcHJvcGVydGllcyA9IHNjaGVtYS5wcm9wZXJ0aWVzLFxuXHRcdFx0XHRcdGk7XG5cdFx0XHRpZiAocHJvcGVydGllc1snKiddICE9IG51bGwpIHtcblx0XHRcdFx0Zm9yIChpIGluIGNhbmRpZGF0ZSkge1xuXHRcdFx0XHRcdGlmIChpIGluIHByb3BlcnRpZXMpIHtcblx0XHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLl9kZWVwZXJPYmplY3QoaSk7XG5cdFx0XHRcdFx0dGhpcy5fdmFsaWRhdGUocHJvcGVydGllc1snKiddLCBjYW5kaWRhdGVbaV0pO1xuXHRcdFx0XHRcdHRoaXMuX2JhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Zm9yIChpIGluIHByb3BlcnRpZXMpIHtcblx0XHRcdFx0aWYgKGkgPT09ICcqJykge1xuXHRcdFx0XHRcdGNvbnRpbnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuX2RlZXBlck9iamVjdChpKTtcblx0XHRcdFx0dGhpcy5fdmFsaWRhdGUocHJvcGVydGllc1tpXSwgY2FuZGlkYXRlW2ldKTtcblx0XHRcdFx0dGhpcy5fYmFjaygpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0aXRlbXM6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSwgY2FsbGJhY2spIHtcblx0XHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuYXN5bmNJdGVtcyhzY2hlbWEsIGNhbmRpZGF0ZSwgY2FsbGJhY2spO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCEoc2NoZW1hLml0ZW1zIGluc3RhbmNlb2YgT2JqZWN0KSB8fCAhKGNhbmRpZGF0ZSBpbnN0YW5jZW9mIE9iamVjdCkpIHtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGl0ZW1zID0gc2NoZW1hLml0ZW1zO1xuXHRcdFx0dmFyIGksIGw7XG5cdFx0XHQvLyBJZiBwcm92aWRlZCBzY2hlbWEgaXMgYW4gYXJyYXlcblx0XHRcdC8vIHRoZW4gY2FsbCB2YWxpZGF0ZSBmb3IgZWFjaCBjYXNlXG5cdFx0XHQvLyBlbHNlIGl0IGlzIGFuIE9iamVjdFxuXHRcdFx0Ly8gdGhlbiBjYWxsIHZhbGlkYXRlIGZvciBlYWNoIGtleVxuXHRcdFx0aWYgKF90eXBlSXMuYXJyYXkoaXRlbXMpICYmIF90eXBlSXMuYXJyYXkoY2FuZGlkYXRlKSkge1xuXHRcdFx0XHRmb3IgKGkgPSAwLCBsID0gaXRlbXMubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHRcdFx0dGhpcy5fZGVlcGVyQXJyYXkoaSk7XG5cdFx0XHRcdFx0dGhpcy5fdmFsaWRhdGUoaXRlbXNbaV0sIGNhbmRpZGF0ZVtpXSk7XG5cdFx0XHRcdFx0dGhpcy5fYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Zm9yICh2YXIga2V5IGluIGNhbmRpZGF0ZSkge1xuXHRcdFx0XHRcdGlmIChjYW5kaWRhdGUuaGFzT3duUHJvcGVydHkoa2V5KSl7XG5cdFx0XHRcdFx0XHR0aGlzLl9kZWVwZXJBcnJheShrZXkpO1xuXHRcdFx0XHRcdFx0dGhpcy5fdmFsaWRhdGUoaXRlbXMsIGNhbmRpZGF0ZVtrZXldKTtcblx0XHRcdFx0XHRcdHRoaXMuX2JhY2soKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHR2YXIgX2FzeW5jVmFsaWRhdGlvbkF0dHJpYnV0ID0ge1xuXHRcdGFzeW5jRXhlYzogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlLCBjYWxsYmFjaykge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0YXN5bmMuZWFjaFNlcmllcyhfdHlwZUlzLmFycmF5KHNjaGVtYS5leGVjKSA/IHNjaGVtYS5leGVjIDogW3NjaGVtYS5leGVjXSwgZnVuY3Rpb24gKGV4ZWMsIGRvbmUpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBleGVjID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0aWYgKGV4ZWMubGVuZ3RoID4gMikge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGV4ZWMuY2FsbChzZWxmLCBzY2hlbWEsIGNhbmRpZGF0ZSwgZG9uZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGV4ZWMuY2FsbChzZWxmLCBzY2hlbWEsIGNhbmRpZGF0ZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YXN5bmMubmV4dFRpY2soZG9uZSk7XG5cdFx0XHR9LCBjYWxsYmFjayk7XG5cdFx0fSxcblx0XHRhc3luY1Byb3BlcnRpZXM6IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSwgY2FsbGJhY2spIHtcblx0XHRcdGlmICghKHNjaGVtYS5wcm9wZXJ0aWVzIGluc3RhbmNlb2YgT2JqZWN0KSB8fCAhX3R5cGVJcy5vYmplY3QoY2FuZGlkYXRlKSkge1xuXHRcdFx0XHRyZXR1cm4gY2FsbGJhY2soKTtcblx0XHRcdH1cblx0XHRcdHZhciBzZWxmID0gdGhpcztcblx0XHRcdHZhciBwcm9wZXJ0aWVzID0gc2NoZW1hLnByb3BlcnRpZXM7XG5cdFx0XHRhc3luYy5zZXJpZXMoW1xuXHRcdFx0XHRmdW5jdGlvbiAobmV4dCkge1xuXHRcdFx0XHRcdGlmIChwcm9wZXJ0aWVzWycqJ10gPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG5leHQoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YXN5bmMuZWFjaFNlcmllcyhPYmplY3Qua2V5cyhjYW5kaWRhdGUpLCBmdW5jdGlvbiAoaSwgZG9uZSkge1xuXHRcdFx0XHRcdFx0aWYgKGkgaW4gcHJvcGVydGllcykge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gYXN5bmMubmV4dFRpY2soZG9uZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzZWxmLl9kZWVwZXJPYmplY3QoaSk7XG5cdFx0XHRcdFx0XHRzZWxmLl9hc3luY1ZhbGlkYXRlKHByb3BlcnRpZXNbJyonXSwgY2FuZGlkYXRlW2ldLCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRcdFx0XHRcdHNlbGYuX2JhY2soKTtcblx0XHRcdFx0XHRcdFx0ZG9uZShlcnIpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSwgbmV4dCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGZ1bmN0aW9uIChuZXh0KSB7XG5cdFx0XHRcdFx0YXN5bmMuZWFjaFNlcmllcyhPYmplY3Qua2V5cyhwcm9wZXJ0aWVzKSwgZnVuY3Rpb24gKGksIGRvbmUpIHtcblx0XHRcdFx0XHRcdGlmIChpID09PSAnKicpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGFzeW5jLm5leHRUaWNrKGRvbmUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0c2VsZi5fZGVlcGVyT2JqZWN0KGkpO1xuXHRcdFx0XHRcdFx0c2VsZi5fYXN5bmNWYWxpZGF0ZShwcm9wZXJ0aWVzW2ldLCBjYW5kaWRhdGVbaV0sIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0c2VsZi5fYmFjaygpO1xuXHRcdFx0XHRcdFx0XHRkb25lKGVycik7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9LCBuZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0XSwgY2FsbGJhY2spO1xuXHRcdH0sXG5cdFx0YXN5bmNJdGVtczogZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlLCBjYWxsYmFjaykge1xuXHRcdFx0aWYgKCEoc2NoZW1hLml0ZW1zIGluc3RhbmNlb2YgT2JqZWN0KSB8fCAhKGNhbmRpZGF0ZSBpbnN0YW5jZW9mIE9iamVjdCkpIHtcblx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKCk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHR2YXIgaXRlbXMgPSBzY2hlbWEuaXRlbXM7XG5cdFx0XHR2YXIgaSwgbDtcblxuXHRcdFx0aWYgKF90eXBlSXMuYXJyYXkoaXRlbXMpICYmIF90eXBlSXMuYXJyYXkoY2FuZGlkYXRlKSkge1xuXHRcdFx0XHRhc3luYy50aW1lc1NlcmllcyhpdGVtcy5sZW5ndGgsIGZ1bmN0aW9uIChpLCBkb25lKSB7XG5cdFx0XHRcdFx0c2VsZi5fZGVlcGVyQXJyYXkoaSk7XG5cdFx0XHRcdFx0c2VsZi5fYXN5bmNWYWxpZGF0ZShpdGVtc1tpXSwgY2FuZGlkYXRlW2ldLCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcblx0XHRcdFx0XHRcdHNlbGYuX2JhY2soKTtcblx0XHRcdFx0XHRcdGRvbmUoZXJyLCByZXMpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHNlbGYuX2JhY2soKTtcblx0XHRcdFx0fSwgY2FsbGJhY2spO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGFzeW5jLmVhY2hTZXJpZXMoT2JqZWN0LmtleXMoY2FuZGlkYXRlKSwgZnVuY3Rpb24gKGtleSwgZG9uZSkge1xuXHRcdFx0XHRcdHNlbGYuX2RlZXBlckFycmF5KGtleSk7XG5cdFx0XHRcdFx0c2VsZi5fYXN5bmNWYWxpZGF0ZShpdGVtcywgY2FuZGlkYXRlW2tleV0sIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuXHRcdFx0XHRcdFx0c2VsZi5fYmFjaygpO1xuXHRcdFx0XHRcdFx0ZG9uZShlcnIsIHJlcyk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0sIGNhbGxiYWNrKTtcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cblx0Ly8gVmFsaWRhdGlvbiBDbGFzcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIGluaGVyaXRzIGZyb20gSW5zcGVjdGlvbiBjbGFzcyAoYWN0dWFsbHkgd2UganVzdCBjYWxsIEluc3BlY3Rpb25cblx0Ly8gY29uc3RydWN0b3Igd2l0aCB0aGUgbmV3IGNvbnRleHQsIGJlY2F1c2UgaXRzIHByb3RvdHlwZSBpcyBlbXB0eVxuXHRmdW5jdGlvbiBWYWxpZGF0aW9uKHNjaGVtYSwgY3VzdG9tKSB7XG5cdFx0SW5zcGVjdGlvbi5wcm90b3R5cGUuY29uc3RydWN0b3IuY2FsbCh0aGlzLCBzY2hlbWEsIF9tZXJnZShWYWxpZGF0aW9uLmN1c3RvbSwgY3VzdG9tKSk7XG5cdFx0dmFyIF9lcnJvciA9IFtdO1xuXG5cdFx0dGhpcy5fYmFzaWNGaWVsZHMgPSBPYmplY3Qua2V5cyhfdmFsaWRhdGlvbkF0dHJpYnV0KTtcblx0XHR0aGlzLl9jdXN0b21GaWVsZHMgPSBPYmplY3Qua2V5cyh0aGlzLl9jdXN0b20pO1xuXHRcdHRoaXMub3JpZ2luID0gbnVsbDtcblxuXHRcdHRoaXMucmVwb3J0ID0gZnVuY3Rpb24gKG1lc3NhZ2UsIGNvZGUpIHtcblx0XHRcdHZhciBuZXdFcnIgPSB7XG5cdFx0XHRcdGNvZGU6IGNvZGUgfHwgdGhpcy51c2VyQ29kZSB8fCBudWxsLFxuXHRcdFx0XHRtZXNzYWdlOiB0aGlzLnVzZXJFcnJvciB8fCBtZXNzYWdlIHx8ICdpcyBpbnZhbGlkJyxcblx0XHRcdFx0cHJvcGVydHk6IHRoaXMudXNlckFsaWFzID8gKHRoaXMudXNlckFsaWFzICsgJyAoJyArIHRoaXMuX2R1bXBTdGFjaygpICsgJyknKSA6IHRoaXMuX2R1bXBTdGFjaygpXG5cdFx0XHR9O1xuXHRcdFx0X2Vycm9yLnB1c2gobmV3RXJyKTtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH07XG5cblx0XHR0aGlzLnJlc3VsdCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGVycm9yOiBfZXJyb3IsXG5cdFx0XHRcdHZhbGlkOiBfZXJyb3IubGVuZ3RoID09PSAwLFxuXHRcdFx0XHRmb3JtYXQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAodGhpcy52YWxpZCA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuICdDYW5kaWRhdGUgaXMgdmFsaWQnO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gdGhpcy5lcnJvci5tYXAoZnVuY3Rpb24gKGkpIHtcblx0XHRcdFx0XHRcdHJldHVybiAnUHJvcGVydHkgJyArIGkucHJvcGVydHkgKyAnOiAnICsgaS5tZXNzYWdlO1xuXHRcdFx0XHRcdH0pLmpvaW4oJ1xcbicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH07XG5cdH1cblxuXHRfZXh0ZW5kKFZhbGlkYXRpb24ucHJvdG90eXBlLCBfdmFsaWRhdGlvbkF0dHJpYnV0KTtcblx0X2V4dGVuZChWYWxpZGF0aW9uLnByb3RvdHlwZSwgX2FzeW5jVmFsaWRhdGlvbkF0dHJpYnV0KTtcblx0X2V4dGVuZChWYWxpZGF0aW9uLCBuZXcgQ3VzdG9taXNhYmxlKCkpO1xuXG5cdFZhbGlkYXRpb24ucHJvdG90eXBlLnZhbGlkYXRlID0gZnVuY3Rpb24gKGNhbmRpZGF0ZSwgY2FsbGJhY2spIHtcblx0XHR0aGlzLm9yaWdpbiA9IGNhbmRpZGF0ZTtcblx0XHRpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRyZXR1cm4gYXN5bmMubmV4dFRpY2soZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRzZWxmLl9hc3luY1ZhbGlkYXRlKHNlbGYuX3NjaGVtYSwgY2FuZGlkYXRlLCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRcdFx0c2VsZi5vcmlnaW4gPSBudWxsO1xuXHRcdFx0XHRcdGNhbGxiYWNrKGVyciwgc2VsZi5yZXN1bHQoKSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl92YWxpZGF0ZSh0aGlzLl9zY2hlbWEsIGNhbmRpZGF0ZSkucmVzdWx0KCk7XG5cdH07XG5cblx0VmFsaWRhdGlvbi5wcm90b3R5cGUuX3ZhbGlkYXRlID0gZnVuY3Rpb24gKHNjaGVtYSwgY2FuZGlkYXRlLCBjYWxsYmFjaykge1xuXHRcdHRoaXMudXNlckNvZGUgPSBzY2hlbWEuY29kZSB8fCBudWxsO1xuXHRcdHRoaXMudXNlckVycm9yID0gc2NoZW1hLmVycm9yIHx8IG51bGw7XG5cdFx0dGhpcy51c2VyQWxpYXMgPSBzY2hlbWEuYWxpYXMgfHwgbnVsbDtcblx0XHR0aGlzLl9iYXNpY0ZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChpKSB7XG5cdFx0XHRpZiAoKGkgaW4gc2NoZW1hIHx8IGkgPT09ICdvcHRpb25hbCcpICYmIHR5cGVvZiB0aGlzW2ldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHRoaXNbaV0oc2NoZW1hLCBjYW5kaWRhdGUpO1xuXHRcdFx0fVxuXHRcdH0sIHRoaXMpO1xuXHRcdHRoaXMuX2N1c3RvbUZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChpKSB7XG5cdFx0XHRpZiAoaSBpbiBzY2hlbWEgJiYgdHlwZW9mIHRoaXMuX2N1c3RvbVtpXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHR0aGlzLl9jdXN0b21baV0uY2FsbCh0aGlzLCBzY2hlbWEsIGNhbmRpZGF0ZSk7XG5cdFx0XHR9XG5cdFx0fSwgdGhpcyk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH07XG5cblx0VmFsaWRhdGlvbi5wcm90b3R5cGUuX2FzeW5jVmFsaWRhdGUgPSBmdW5jdGlvbiAoc2NoZW1hLCBjYW5kaWRhdGUsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHRoaXMudXNlckNvZGUgPSBzY2hlbWEuY29kZSB8fCBudWxsO1xuXHRcdHRoaXMudXNlckVycm9yID0gc2NoZW1hLmVycm9yIHx8IG51bGw7XG5cdFx0dGhpcy51c2VyQWxpYXMgPSBzY2hlbWEuYWxpYXMgfHwgbnVsbDtcblxuXHRcdGFzeW5jLnNlcmllcyhbXG5cdFx0XHRmdW5jdGlvbiAobmV4dCkge1xuXHRcdFx0XHRhc3luYy5lYWNoU2VyaWVzKE9iamVjdC5rZXlzKF92YWxpZGF0aW9uQXR0cmlidXQpLCBmdW5jdGlvbiAoaSwgZG9uZSkge1xuXHRcdFx0XHRcdGFzeW5jLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGlmICgoaSBpbiBzY2hlbWEgfHwgaSA9PT0gJ29wdGlvbmFsJykgJiYgdHlwZW9mIHNlbGZbaV0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0XHRcdFx0aWYgKHNlbGZbaV0ubGVuZ3RoID4gMikge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmW2ldKHNjaGVtYSwgY2FuZGlkYXRlLCBkb25lKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRzZWxmW2ldKHNjaGVtYSwgY2FuZGlkYXRlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGRvbmUoKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSwgbmV4dCk7XG5cdFx0XHR9LFxuXHRcdFx0ZnVuY3Rpb24gKG5leHQpIHtcblx0XHRcdFx0YXN5bmMuZWFjaFNlcmllcyhPYmplY3Qua2V5cyhzZWxmLl9jdXN0b20pLCBmdW5jdGlvbiAoaSwgZG9uZSkge1xuXHRcdFx0XHRcdGFzeW5jLm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGlmIChpIGluIHNjaGVtYSAmJiB0eXBlb2Ygc2VsZi5fY3VzdG9tW2ldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzZWxmLl9jdXN0b21baV0ubGVuZ3RoID4gMikge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzZWxmLl9jdXN0b21baV0uY2FsbChzZWxmLCBzY2hlbWEsIGNhbmRpZGF0ZSwgZG9uZSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0c2VsZi5fY3VzdG9tW2ldLmNhbGwoc2VsZiwgc2NoZW1hLCBjYW5kaWRhdGUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9LCBuZXh0KTtcblx0XHRcdH1cblx0XHRdLCBjYWxsYmFjayk7XG5cdH07XG5cbi8vIFNhbml0aXphdGlvbiAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIGZ1bmN0aW9ucyBjYWxsZWQgYnkgX3Nhbml0aXphdGlvbi50eXBlIG1ldGhvZC5cblx0dmFyIF9mb3JjZVR5cGUgPSB7XG5cdFx0bnVtYmVyOiBmdW5jdGlvbiAocG9zdCwgc2NoZW1hKSB7XG5cdFx0XHR2YXIgbjtcblx0XHRcdGlmICh0eXBlb2YgcG9zdCA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChwb3N0ID09PSAnJykge1xuXHRcdFx0XHRpZiAodHlwZW9mIHNjaGVtYS5kZWYgIT09ICd1bmRlZmluZWQnKVxuXHRcdFx0XHRcdHJldHVybiBzY2hlbWEuZGVmO1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBwb3N0ID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRuID0gcGFyc2VGbG9hdChwb3N0LnJlcGxhY2UoLywvZywgJy4nKS5yZXBsYWNlKC8gL2csICcnKSk7XG5cdFx0XHRcdGlmICh0eXBlb2YgbiA9PT0gJ251bWJlcicpIHtcblx0XHRcdFx0XHRyZXR1cm4gbjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocG9zdCBpbnN0YW5jZW9mIERhdGUpIHtcblx0XHRcdFx0cmV0dXJuICtwb3N0O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSxcblx0XHRpbnRlZ2VyOiBmdW5jdGlvbiAocG9zdCwgc2NoZW1hKSB7XG5cdFx0XHR2YXIgbjtcblx0XHRcdGlmICh0eXBlb2YgcG9zdCA9PT0gJ251bWJlcicgJiYgcG9zdCAlIDEgPT09IDApIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHRlbHNlIGlmIChwb3N0ID09PSAnJykge1xuXHRcdFx0XHRpZiAodHlwZW9mIHNjaGVtYS5kZWYgIT09ICd1bmRlZmluZWQnKVxuXHRcdFx0XHRcdHJldHVybiBzY2hlbWEuZGVmO1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBwb3N0ID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRuID0gcGFyc2VJbnQocG9zdC5yZXBsYWNlKC8gL2csICcnKSwgMTApO1xuXHRcdFx0XHRpZiAodHlwZW9mIG4gPT09ICdudW1iZXInKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG47XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBwb3N0ID09PSAnbnVtYmVyJykge1xuXHRcdFx0XHRyZXR1cm4gcGFyc2VJbnQocG9zdCwgMTApO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAodHlwZW9mIHBvc3QgPT09ICdib29sZWFuJykge1xuXHRcdFx0XHRpZiAocG9zdCkgeyByZXR1cm4gMTsgfVxuXHRcdFx0XHRyZXR1cm4gMDtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHBvc3QgaW5zdGFuY2VvZiBEYXRlKSB7XG5cdFx0XHRcdHJldHVybiArcG9zdDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0sXG5cdFx0c3RyaW5nOiBmdW5jdGlvbiAocG9zdCwgc2NoZW1hKSB7XG5cdFx0XHRpZiAodHlwZW9mIHBvc3QgPT09ICdib29sZWFuJyB8fCB0eXBlb2YgcG9zdCA9PT0gJ251bWJlcicgfHwgcG9zdCBpbnN0YW5jZW9mIERhdGUpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3QudG9TdHJpbmcoKTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKF90eXBlSXMuYXJyYXkocG9zdCkpIHtcblx0XHRcdFx0Ly8gSWYgdXNlciBhdXRob3JpemUgYXJyYXkgYW5kIHN0cmluZ3MuLi5cblx0XHRcdFx0aWYgKHNjaGVtYS5pdGVtcyB8fCBzY2hlbWEucHJvcGVydGllcylcblx0XHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdFx0cmV0dXJuIHBvc3Quam9pbihTdHJpbmcoc2NoZW1hLmpvaW5XaXRoIHx8ICcsJykpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSBpZiAocG9zdCBpbnN0YW5jZW9mIE9iamVjdCkge1xuXHRcdFx0XHQvLyBJZiB1c2VyIGF1dGhvcml6ZSBvYmplY3RzIGFucyBzdHJpbmdzLi4uXG5cdFx0XHRcdGlmIChzY2hlbWEuaXRlbXMgfHwgc2NoZW1hLnByb3BlcnRpZXMpXG5cdFx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShwb3N0KTtcblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKHR5cGVvZiBwb3N0ID09PSAnc3RyaW5nJyAmJiBwb3N0Lmxlbmd0aCkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0sXG5cdFx0ZGF0ZTogZnVuY3Rpb24gKHBvc3QsIHNjaGVtYSkge1xuXHRcdFx0aWYgKHBvc3QgaW5zdGFuY2VvZiBEYXRlKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHZhciBkID0gbmV3IERhdGUocG9zdCk7XG5cdFx0XHRcdGlmICghaXNOYU4oZC5nZXRUaW1lKCkpKSB7IC8vIGlmIHZhbGlkIGRhdGVcblx0XHRcdFx0XHRyZXR1cm4gZDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fSxcblx0XHRib29sZWFuOiBmdW5jdGlvbiAocG9zdCwgc2NoZW1hKSB7XG5cdFx0XHRpZiAodHlwZW9mIHBvc3QgPT09ICd1bmRlZmluZWQnKSByZXR1cm4gbnVsbDtcblx0XHRcdGlmICh0eXBlb2YgcG9zdCA9PT0gJ3N0cmluZycgJiYgcG9zdC50b0xvd2VyQ2FzZSgpID09PSAnZmFsc2UnKSByZXR1cm4gZmFsc2U7XG5cdFx0XHRyZXR1cm4gISFwb3N0O1xuXHRcdH0sXG5cdFx0b2JqZWN0OiBmdW5jdGlvbiAocG9zdCwgc2NoZW1hKSB7XG5cdFx0XHRpZiAodHlwZW9mIHBvc3QgIT09ICdzdHJpbmcnIHx8IF90eXBlSXMub2JqZWN0KHBvc3QpKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0dHJ5IHtcblx0XHRcdFx0cmV0dXJuIEpTT04ucGFyc2UocG9zdCk7XG5cdFx0XHR9XG5cdFx0XHRjYXRjaCAoZSkge1xuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdH1cblx0XHR9LFxuXHRcdGFycmF5OiBmdW5jdGlvbiAocG9zdCwgc2NoZW1hKSB7XG5cdFx0XHRpZiAoX3R5cGVJcy5hcnJheShwb3N0KSlcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHRpZiAodHlwZW9mIHBvc3QgPT09ICd1bmRlZmluZWQnKVxuXHRcdFx0XHRyZXR1cm4gbnVsbDtcblx0XHRcdGlmICh0eXBlb2YgcG9zdCA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0aWYgKHBvc3Quc3Vic3RyaW5nKDAsMSkgPT09ICdbJyAmJiBwb3N0LnNsaWNlKC0xKSA9PT0gJ10nKSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdHJldHVybiBKU09OLnBhcnNlKHBvc3QpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBwb3N0LnNwbGl0KFN0cmluZyhzY2hlbWEuc3BsaXRXaXRoIHx8ICcsJykpO1xuXG5cdFx0XHR9XG5cdFx0XHRpZiAoIV90eXBlSXMuYXJyYXkocG9zdCkpXG5cdFx0XHRcdHJldHVybiBbIHBvc3QgXTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fTtcblxuXHR2YXIgX2FwcGx5UnVsZXMgPSB7XG5cdFx0dXBwZXI6IGZ1bmN0aW9uIChwb3N0KSB7XG5cdFx0XHRyZXR1cm4gcG9zdC50b1VwcGVyQ2FzZSgpO1xuXHRcdH0sXG5cdFx0bG93ZXI6IGZ1bmN0aW9uIChwb3N0KSB7XG5cdFx0XHRyZXR1cm4gcG9zdC50b0xvd2VyQ2FzZSgpO1xuXHRcdH0sXG5cdFx0dGl0bGU6IGZ1bmN0aW9uIChwb3N0KSB7XG5cdFx0XHQvLyBGaXggYnkgc2ViIChyZXBsYWNlIFxcd1xcUyogYnkgXFxTKiA9PiBleGVtcGxlIDogY291Y291IMOnYSB2YSlcblx0XHRcdHJldHVybiBwb3N0LnJlcGxhY2UoL1xcUyovZywgZnVuY3Rpb24gKHR4dCkge1xuXHRcdFx0XHRyZXR1cm4gdHh0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgdHh0LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpO1xuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRjYXBpdGFsaXplOiBmdW5jdGlvbiAocG9zdCkge1xuXHRcdFx0cmV0dXJuIHBvc3QuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyBwb3N0LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpO1xuXHRcdH0sXG5cdFx0dWNmaXJzdDogZnVuY3Rpb24gKHBvc3QpIHtcblx0XHRcdHJldHVybiBwb3N0LmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgcG9zdC5zdWJzdHIoMSk7XG5cdFx0fSxcblx0XHR0cmltOiBmdW5jdGlvbiAocG9zdCkge1xuXHRcdFx0cmV0dXJuIHBvc3QudHJpbSgpO1xuXHRcdH1cblx0fTtcblxuXHQvLyBFdmVyeSBmdW5jdGlvbiByZXR1cm4gdGhlIGZ1dHVyZSB2YWx1ZSBvZiBlYWNoIHByb3BlcnR5LiBUaGVyZWZvcmUgeW91XG5cdC8vIGhhdmUgdG8gcmV0dXJuIHBvc3QgZXZlbiBpZiB5b3UgZG8gbm90IGNoYW5nZSBpdHMgdmFsdWVcblx0dmFyIF9zYW5pdGl6YXRpb25BdHRyaWJ1dCA9IHtcblx0XHRzdHJpY3Q6IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QpIHtcblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hLnN0cmljdCA9PT0gJ3N0cmluZycpIHsgc2NoZW1hLnN0cmljdCA9IChzY2hlbWEuc3RyaWN0ID09PSAndHJ1ZScpOyB9XG5cdFx0XHRpZiAoc2NoZW1hLnN0cmljdCAhPT0gdHJ1ZSlcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHRpZiAoIV90eXBlSXMub2JqZWN0KHNjaGVtYS5wcm9wZXJ0aWVzKSlcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHRpZiAoIV90eXBlSXMub2JqZWN0KHBvc3QpKVxuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdHZhciB0aGF0ID0gdGhpcztcblx0XHRcdE9iamVjdC5rZXlzKHBvc3QpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdFx0XHRpZiAoIShrZXkgaW4gc2NoZW1hLnByb3BlcnRpZXMpKSB7XG5cdFx0XHRcdFx0ZGVsZXRlIHBvc3Rba2V5XTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcG9zdDtcblx0XHR9LFxuXHRcdG9wdGlvbmFsOiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0KSB7XG5cdFx0XHR2YXIgb3B0ID0gdHlwZW9mIHNjaGVtYS5vcHRpb25hbCA9PT0gJ2Jvb2xlYW4nID8gc2NoZW1hLm9wdGlvbmFsIDogKHNjaGVtYS5vcHRpb25hbCAhPT0gJ2ZhbHNlJyk7IC8vIERlZmF1bHQ6IHRydWVcblx0XHRcdGlmIChvcHQgPT09IHRydWUpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHRpZiAodHlwZW9mIHBvc3QgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5yZXBvcnQoKTtcblx0XHRcdGlmIChzY2hlbWEuZGVmID09PSBEYXRlKSB7XG5cdFx0XHRcdHJldHVybiBuZXcgRGF0ZSgpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHNjaGVtYS5kZWY7XG5cdFx0fSxcblx0XHR0eXBlOiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0KSB7XG5cdFx0XHQvLyBpZiAoX3R5cGVJc1snb2JqZWN0J10ocG9zdCkgfHwgX3R5cGVJcy5hcnJheShwb3N0KSkge1xuXHRcdFx0Ly8gXHRyZXR1cm4gcG9zdDtcblx0XHRcdC8vIH1cblx0XHRcdGlmICh0eXBlb2Ygc2NoZW1hLnR5cGUgIT09ICdzdHJpbmcnIHx8IHR5cGVvZiBfZm9yY2VUeXBlW3NjaGVtYS50eXBlXSAhPT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdHZhciBuO1xuXHRcdFx0dmFyIG9wdCA9IHR5cGVvZiBzY2hlbWEub3B0aW9uYWwgPT09ICdib29sZWFuJyA/IHNjaGVtYS5vcHRpb25hbCA6IHRydWU7XG5cdFx0XHRpZiAodHlwZW9mIF9mb3JjZVR5cGVbc2NoZW1hLnR5cGVdID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdG4gPSBfZm9yY2VUeXBlW3NjaGVtYS50eXBlXShwb3N0LCBzY2hlbWEpO1xuXHRcdFx0XHRpZiAoKG4gPT09IG51bGwgJiYgIW9wdCkgfHwgKCFuICYmIGlzTmFOKG4pKSB8fCAobiA9PT0gbnVsbCAmJiBzY2hlbWEudHlwZSA9PT0gJ3N0cmluZycpKSB7XG5cdFx0XHRcdFx0biA9IHNjaGVtYS5kZWY7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGVsc2UgaWYgKCFvcHQpIHtcblx0XHRcdFx0biA9IHNjaGVtYS5kZWY7XG5cdFx0XHR9XG5cdFx0XHRpZiAoKG4gIT0gbnVsbCB8fCAodHlwZW9mIHNjaGVtYS5kZWYgIT09ICd1bmRlZmluZWQnICYmIHNjaGVtYS5kZWYgPT09IG4pKSAmJiBuICE9PSBwb3N0KSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCk7XG5cdFx0XHRcdHJldHVybiBuO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0fSxcblx0XHRydWxlczogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCkge1xuXHRcdFx0dmFyIHJ1bGVzID0gc2NoZW1hLnJ1bGVzO1xuXHRcdFx0aWYgKHR5cGVvZiBwb3N0ICE9PSAnc3RyaW5nJyB8fCAodHlwZW9mIHJ1bGVzICE9PSAnc3RyaW5nJyAmJiAhX3R5cGVJcy5hcnJheShydWxlcykpKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0dmFyIG1vZGlmaWVkID0gZmFsc2U7XG5cdFx0XHQoX3R5cGVJcy5hcnJheShydWxlcykgPyBydWxlcyA6IFtydWxlc10pLmZvckVhY2goZnVuY3Rpb24gKHJ1bGUpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBfYXBwbHlSdWxlc1tydWxlXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdHBvc3QgPSBfYXBwbHlSdWxlc1tydWxlXShwb3N0KTtcblx0XHRcdFx0XHRtb2RpZmllZCA9IHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0aWYgKG1vZGlmaWVkKSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcG9zdDtcblx0XHR9LFxuXHRcdG1pbjogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCkge1xuXHRcdFx0dmFyIHBvc3RUZXN0ID0gTnVtYmVyKHBvc3QpO1xuXHRcdFx0aWYgKGlzTmFOKHBvc3RUZXN0KSkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdHZhciBtaW4gPSBOdW1iZXIoc2NoZW1hLm1pbik7XG5cdFx0XHRpZiAoaXNOYU4obWluKSkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdGlmIChwb3N0VGVzdCA8IG1pbikge1xuXHRcdFx0XHR0aGlzLnJlcG9ydCgpO1xuXHRcdFx0XHRyZXR1cm4gbWluO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0fSxcblx0XHRtYXg6IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QpIHtcblx0XHRcdHZhciBwb3N0VGVzdCA9IE51bWJlcihwb3N0KTtcblx0XHRcdGlmIChpc05hTihwb3N0VGVzdCkpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHR2YXIgbWF4ID0gTnVtYmVyKHNjaGVtYS5tYXgpO1xuXHRcdFx0aWYgKGlzTmFOKG1heCkpIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHRpZiAocG9zdFRlc3QgPiBtYXgpIHtcblx0XHRcdFx0dGhpcy5yZXBvcnQoKTtcblx0XHRcdFx0cmV0dXJuIG1heDtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwb3N0O1xuXHRcdH0sXG5cdFx0bWluTGVuZ3RoOiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0KSB7XG5cdFx0XHR2YXIgbGltaXQgPSBOdW1iZXIoc2NoZW1hLm1pbkxlbmd0aCk7XG5cdFx0XHRpZiAodHlwZW9mIHBvc3QgIT09ICdzdHJpbmcnIHx8IGlzTmFOKGxpbWl0KSB8fCBsaW1pdCA8IDApIHtcblx0XHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0XHR9XG5cdFx0XHR2YXIgc3RyID0gJyc7XG5cdFx0XHR2YXIgZ2FwID0gbGltaXQgLSBwb3N0Lmxlbmd0aDtcblx0XHRcdGlmIChnYXAgPiAwKSB7XG5cdFx0XHRcdGZvciAodmFyIGkgPSAwOyBpIDwgZ2FwOyBpKyspIHtcblx0XHRcdFx0XHRzdHIgKz0gJy0nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMucmVwb3J0KCk7XG5cdFx0XHRcdHJldHVybiBwb3N0ICsgc3RyO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHBvc3Q7XG5cdFx0fSxcblx0XHRtYXhMZW5ndGg6IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QpIHtcblx0XHRcdHZhciBsaW1pdCA9IE51bWJlcihzY2hlbWEubWF4TGVuZ3RoKTtcblx0XHRcdGlmICh0eXBlb2YgcG9zdCAhPT0gJ3N0cmluZycgfHwgaXNOYU4obGltaXQpIHx8IGxpbWl0IDwgMCkge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdGlmIChwb3N0Lmxlbmd0aCA+IGxpbWl0KSB7XG5cdFx0XHRcdHRoaXMucmVwb3J0KCk7XG5cdFx0XHRcdHJldHVybiBwb3N0LnNsaWNlKDAsIGxpbWl0KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwb3N0O1xuXHRcdH0sXG5cdFx0cHJvcGVydGllczogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCwgY2FsbGJhY2spIHtcblx0XHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuYXN5bmNQcm9wZXJ0aWVzKHNjaGVtYSwgcG9zdCwgY2FsbGJhY2spO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFwb3N0IHx8IHR5cGVvZiBwb3N0ICE9PSAnb2JqZWN0Jykge1xuXHRcdFx0XHRyZXR1cm4gcG9zdDtcblx0XHRcdH1cblx0XHRcdHZhciBwcm9wZXJ0aWVzID0gc2NoZW1hLnByb3BlcnRpZXM7XG5cdFx0XHR2YXIgdG1wO1xuXHRcdFx0dmFyIGk7XG5cdFx0XHRpZiAodHlwZW9mIHByb3BlcnRpZXNbJyonXSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0Zm9yIChpIGluIHBvc3QpIHtcblx0XHRcdFx0XHRpZiAoaSBpbiBwcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5fZGVlcGVyT2JqZWN0KGkpO1xuXHRcdFx0XHRcdHRtcCA9IHRoaXMuX3Nhbml0aXplKHNjaGVtYS5wcm9wZXJ0aWVzWycqJ10sIHBvc3RbaV0pO1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgdG1wICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0cG9zdFtpXT0gdG1wO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aGlzLl9iYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAoaSBpbiBzY2hlbWEucHJvcGVydGllcykge1xuXHRcdFx0XHRpZiAoaSAhPT0gJyonKSB7XG5cdFx0XHRcdFx0dGhpcy5fZGVlcGVyT2JqZWN0KGkpO1xuXHRcdFx0XHRcdHRtcCA9IHRoaXMuX3Nhbml0aXplKHNjaGVtYS5wcm9wZXJ0aWVzW2ldLCBwb3N0W2ldKTtcblx0XHRcdFx0XHRpZiAodHlwZW9mIHRtcCAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHBvc3RbaV09IHRtcDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5fYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcG9zdDtcblx0XHR9LFxuXHRcdGl0ZW1zOiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0LCBjYWxsYmFjaykge1xuXHRcdFx0aWYgKHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5hc3luY0l0ZW1zKHNjaGVtYSwgcG9zdCwgY2FsbGJhY2spO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCEoc2NoZW1hLml0ZW1zIGluc3RhbmNlb2YgT2JqZWN0KSB8fCAhKHBvc3QgaW5zdGFuY2VvZiBPYmplY3QpKSB7XG5cdFx0XHRcdHJldHVybiBwb3N0O1xuXHRcdFx0fVxuXHRcdFx0dmFyIGk7XG5cdFx0XHRpZiAoX3R5cGVJcy5hcnJheShzY2hlbWEuaXRlbXMpICYmIF90eXBlSXMuYXJyYXkocG9zdCkpIHtcblx0XHRcdFx0dmFyIG1pbkxlbmd0aCA9IHNjaGVtYS5pdGVtcy5sZW5ndGggPCBwb3N0Lmxlbmd0aCA/IHNjaGVtYS5pdGVtcy5sZW5ndGggOiBwb3N0Lmxlbmd0aDtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IG1pbkxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0dGhpcy5fZGVlcGVyQXJyYXkoaSk7XG5cdFx0XHRcdFx0cG9zdFtpXSA9IHRoaXMuX3Nhbml0aXplKHNjaGVtYS5pdGVtc1tpXSwgcG9zdFtpXSk7XG5cdFx0XHRcdFx0dGhpcy5fYmFjaygpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRlbHNlIHtcblx0XHRcdFx0Zm9yIChpIGluIHBvc3QpIHtcblx0XHRcdFx0XHR0aGlzLl9kZWVwZXJBcnJheShpKTtcblx0XHRcdFx0XHRwb3N0W2ldID0gdGhpcy5fc2FuaXRpemUoc2NoZW1hLml0ZW1zLCBwb3N0W2ldKTtcblx0XHRcdFx0XHR0aGlzLl9iYWNrKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBwb3N0O1xuXHRcdH0sXG5cdFx0ZXhlYzogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCwgY2FsbGJhY2spIHtcblx0XHRcdGlmICh0eXBlb2YgY2FsbGJhY2sgPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuYXN5bmNFeGVjKHNjaGVtYSwgcG9zdCwgY2FsbGJhY2spO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGV4ZWNzID0gX3R5cGVJcy5hcnJheShzY2hlbWEuZXhlYykgPyBzY2hlbWEuZXhlYyA6IFtzY2hlbWEuZXhlY107XG5cblx0XHRcdGV4ZWNzLmZvckVhY2goZnVuY3Rpb24gKGV4ZWMpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBleGVjID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0cG9zdCA9IGV4ZWMuY2FsbCh0aGlzLCBzY2hlbWEsIHBvc3QpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCB0aGlzKTtcblx0XHRcdHJldHVybiBwb3N0O1xuXHRcdH1cblx0fTtcblxuXHR2YXIgX2FzeW5jU2FuaXRpemF0aW9uQXR0cmlidXQgPSB7XG5cdFx0YXN5bmNFeGVjOiBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0LCBjYWxsYmFjaykge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0dmFyIGV4ZWNzID0gX3R5cGVJcy5hcnJheShzY2hlbWEuZXhlYykgPyBzY2hlbWEuZXhlYyA6IFtzY2hlbWEuZXhlY107XG5cblx0XHRcdGFzeW5jLmVhY2hTZXJpZXMoZXhlY3MsIGZ1bmN0aW9uIChleGVjLCBkb25lKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgZXhlYyA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdGlmIChleGVjLmxlbmd0aCA+IDIpIHtcblx0XHRcdFx0XHRcdHJldHVybiBleGVjLmNhbGwoc2VsZiwgc2NoZW1hLCBwb3N0LCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcblx0XHRcdFx0XHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBkb25lKGVycik7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cG9zdCA9IHJlcztcblx0XHRcdFx0XHRcdFx0ZG9uZSgpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHBvc3QgPSBleGVjLmNhbGwoc2VsZiwgc2NoZW1hLCBwb3N0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRkb25lKCk7XG5cdFx0XHR9LCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRcdGNhbGxiYWNrKGVyciwgcG9zdCk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGFzeW5jUHJvcGVydGllczogZnVuY3Rpb24gKHNjaGVtYSwgcG9zdCwgY2FsbGJhY2spIHtcblx0XHRcdGlmICghcG9zdCB8fCB0eXBlb2YgcG9zdCAhPT0gJ29iamVjdCcpIHtcblx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKG51bGwsIHBvc3QpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0dmFyIHByb3BlcnRpZXMgPSBzY2hlbWEucHJvcGVydGllcztcblxuXHRcdFx0YXN5bmMuc2VyaWVzKFtcblx0XHRcdFx0ZnVuY3Rpb24gKG5leHQpIHtcblx0XHRcdFx0XHRpZiAocHJvcGVydGllc1snKiddID09IG51bGwpIHtcblx0XHRcdFx0XHRcdHJldHVybiBuZXh0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHZhciBnbG9iaW5nID0gcHJvcGVydGllc1snKiddO1xuXHRcdFx0XHRcdGFzeW5jLmVhY2hTZXJpZXMoT2JqZWN0LmtleXMocG9zdCksIGZ1bmN0aW9uIChpLCBuZXh0KSB7XG5cdFx0XHRcdFx0XHRpZiAoaSBpbiBwcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXh0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzZWxmLl9kZWVwZXJPYmplY3QoaSk7XG5cdFx0XHRcdFx0XHRzZWxmLl9hc3luY1Nhbml0aXplKGdsb2JpbmcsIHBvc3RbaV0sIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuXHRcdFx0XHRcdFx0XHRpZiAoZXJyKSB7IC8qIEVycm9yIGNhbiBzYWZlbHkgYmUgaWdub3JlZCBoZXJlICovIH1cblx0XHRcdFx0XHRcdFx0aWYgKHR5cGVvZiByZXMgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHRcdFx0cG9zdFtpXSA9IHJlcztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRzZWxmLl9iYWNrKCk7XG5cdFx0XHRcdFx0XHRcdG5leHQoKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0sIG5leHQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRmdW5jdGlvbiAobmV4dCkge1xuXHRcdFx0XHRcdGFzeW5jLmVhY2hTZXJpZXMoT2JqZWN0LmtleXMocHJvcGVydGllcyksIGZ1bmN0aW9uIChpLCBuZXh0KSB7XG5cdFx0XHRcdFx0XHRpZiAoaSA9PT0gJyonKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBuZXh0KCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRzZWxmLl9kZWVwZXJPYmplY3QoaSk7XG5cdFx0XHRcdFx0XHRzZWxmLl9hc3luY1Nhbml0aXplKHByb3BlcnRpZXNbaV0sIHBvc3RbaV0sIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuXHRcdFx0XHRcdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG5leHQoZXJyKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpZiAodHlwZW9mIHJlcyAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdFx0XHRwb3N0W2ldID0gcmVzO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHNlbGYuX2JhY2soKTtcblx0XHRcdFx0XHRcdFx0bmV4dCgpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSwgbmV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdF0sIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKGVyciwgcG9zdCk7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGFzeW5jSXRlbXM6IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QsIGNhbGxiYWNrKSB7XG5cdFx0XHRpZiAoIShzY2hlbWEuaXRlbXMgaW5zdGFuY2VvZiBPYmplY3QpIHx8ICEocG9zdCBpbnN0YW5jZW9mIE9iamVjdCkpIHtcblx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrKG51bGwsIHBvc3QpO1xuXHRcdFx0fVxuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0dmFyIGl0ZW1zID0gc2NoZW1hLml0ZW1zO1xuXHRcdFx0aWYgKF90eXBlSXMuYXJyYXkoaXRlbXMpICYmIF90eXBlSXMuYXJyYXkocG9zdCkpIHtcblx0XHRcdFx0dmFyIG1pbkxlbmd0aCA9IGl0ZW1zLmxlbmd0aCA8IHBvc3QubGVuZ3RoID8gaXRlbXMubGVuZ3RoIDogcG9zdC5sZW5ndGg7XG5cdFx0XHRcdGFzeW5jLnRpbWVzU2VyaWVzKG1pbkxlbmd0aCwgZnVuY3Rpb24gKGksIG5leHQpIHtcblx0XHRcdFx0XHRzZWxmLl9kZWVwZXJBcnJheShpKTtcblx0XHRcdFx0XHRzZWxmLl9hc3luY1Nhbml0aXplKGl0ZW1zW2ldLCBwb3N0W2ldLCBmdW5jdGlvbiAoZXJyLCByZXMpIHtcblx0XHRcdFx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG5leHQoZXJyKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHBvc3RbaV0gPSByZXM7XG5cdFx0XHRcdFx0XHRzZWxmLl9iYWNrKCk7XG5cdFx0XHRcdFx0XHRuZXh0KCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0sIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0XHRjYWxsYmFjayhlcnIsIHBvc3QpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRhc3luYy5lYWNoU2VyaWVzKE9iamVjdC5rZXlzKHBvc3QpLCBmdW5jdGlvbiAoa2V5LCBuZXh0KSB7XG5cdFx0XHRcdFx0c2VsZi5fZGVlcGVyQXJyYXkoa2V5KTtcblx0XHRcdFx0XHRzZWxmLl9hc3luY1Nhbml0aXplKGl0ZW1zLCBwb3N0W2tleV0sIGZ1bmN0aW9uIChlcnIsIHJlcykge1xuXHRcdFx0XHRcdFx0aWYgKGVycikge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gbmV4dCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cG9zdFtrZXldID0gcmVzO1xuXHRcdFx0XHRcdFx0c2VsZi5fYmFjaygpO1xuXHRcdFx0XHRcdFx0bmV4dCgpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9LCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soZXJyLCBwb3N0KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcG9zdDtcblx0XHR9XG5cdH07XG5cblx0Ly8gU2FuaXRpemF0aW9uIENsYXNzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdC8vIGluaGVyaXRzIGZyb20gSW5zcGVjdGlvbiBjbGFzcyAoYWN0dWFsbHkgd2UganVzdCBjYWxsIEluc3BlY3Rpb25cblx0Ly8gY29uc3RydWN0b3Igd2l0aCB0aGUgbmV3IGNvbnRleHQsIGJlY2F1c2UgaXRzIHByb3RvdHlwZSBpcyBlbXB0eVxuXHRmdW5jdGlvbiBTYW5pdGl6YXRpb24oc2NoZW1hLCBjdXN0b20pIHtcblx0XHRJbnNwZWN0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3Rvci5jYWxsKHRoaXMsIHNjaGVtYSwgX21lcmdlKFNhbml0aXphdGlvbi5jdXN0b20sIGN1c3RvbSkpO1xuXHRcdHZhciBfcmVwb3J0aW5nID0gW107XG5cblx0XHR0aGlzLl9iYXNpY0ZpZWxkcyA9IE9iamVjdC5rZXlzKF9zYW5pdGl6YXRpb25BdHRyaWJ1dCk7XG5cdFx0dGhpcy5fY3VzdG9tRmllbGRzID0gT2JqZWN0LmtleXModGhpcy5fY3VzdG9tKTtcblx0XHR0aGlzLm9yaWdpbiA9IG51bGw7XG5cblx0XHR0aGlzLnJlcG9ydCA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG5cdFx0XHR2YXIgbmV3Tm90ID0ge1xuXHRcdFx0XHRcdG1lc3NhZ2U6IG1lc3NhZ2UgfHwgJ3dhcyBzYW5pdGl6ZWQnLFxuXHRcdFx0XHRcdHByb3BlcnR5OiB0aGlzLnVzZXJBbGlhcyA/ICh0aGlzLnVzZXJBbGlhcyArICcgKCcgKyB0aGlzLl9kdW1wU3RhY2soKSArICcpJykgOiB0aGlzLl9kdW1wU3RhY2soKVxuXHRcdFx0fTtcblx0XHRcdGlmICghX3JlcG9ydGluZy5zb21lKGZ1bmN0aW9uIChlKSB7IHJldHVybiBlLnByb3BlcnR5ID09PSBuZXdOb3QucHJvcGVydHk7IH0pKSB7XG5cdFx0XHRcdF9yZXBvcnRpbmcucHVzaChuZXdOb3QpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHR0aGlzLnJlc3VsdCA9IGZ1bmN0aW9uIChkYXRhKSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRkYXRhOiBkYXRhLFxuXHRcdFx0XHRyZXBvcnRpbmc6IF9yZXBvcnRpbmcsXG5cdFx0XHRcdGZvcm1hdDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLnJlcG9ydGluZy5tYXAoZnVuY3Rpb24gKGkpIHtcblx0XHRcdFx0XHRcdHJldHVybiAnUHJvcGVydHkgJyArIGkucHJvcGVydHkgKyAnICcgKyBpLm1lc3NhZ2U7XG5cdFx0XHRcdFx0fSkuam9pbignXFxuJyk7XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fTtcblx0fVxuXG5cdF9leHRlbmQoU2FuaXRpemF0aW9uLnByb3RvdHlwZSwgX3Nhbml0aXphdGlvbkF0dHJpYnV0KTtcblx0X2V4dGVuZChTYW5pdGl6YXRpb24ucHJvdG90eXBlLCBfYXN5bmNTYW5pdGl6YXRpb25BdHRyaWJ1dCk7XG5cdF9leHRlbmQoU2FuaXRpemF0aW9uLCBuZXcgQ3VzdG9taXNhYmxlKCkpO1xuXG5cblx0U2FuaXRpemF0aW9uLnByb3RvdHlwZS5zYW5pdGl6ZSA9IGZ1bmN0aW9uIChwb3N0LCBjYWxsYmFjaykge1xuXHRcdHRoaXMub3JpZ2luID0gcG9zdDtcblx0XHRpZiAodHlwZW9mIGNhbGxiYWNrID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHR2YXIgc2VsZiA9IHRoaXM7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYXN5bmNTYW5pdGl6ZSh0aGlzLl9zY2hlbWEsIHBvc3QsIGZ1bmN0aW9uIChlcnIsIGRhdGEpIHtcblx0XHRcdFx0c2VsZi5vcmlnaW4gPSBudWxsO1xuXHRcdFx0XHRjYWxsYmFjayhlcnIsIHNlbGYucmVzdWx0KGRhdGEpKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHR2YXIgZGF0YSA9IHRoaXMuX3Nhbml0aXplKHRoaXMuX3NjaGVtYSwgcG9zdCk7XG5cdFx0dGhpcy5vcmlnaW4gPSBudWxsO1xuXHRcdHJldHVybiB0aGlzLnJlc3VsdChkYXRhKTtcblx0fTtcblxuXHRTYW5pdGl6YXRpb24ucHJvdG90eXBlLl9zYW5pdGl6ZSA9IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QpIHtcblx0XHR0aGlzLnVzZXJBbGlhcyA9IHNjaGVtYS5hbGlhcyB8fCBudWxsO1xuXHRcdHRoaXMuX2Jhc2ljRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKGkpIHtcblx0XHRcdGlmICgoaSBpbiBzY2hlbWEgfHwgaSA9PT0gJ29wdGlvbmFsJykgJiYgdHlwZW9mIHRoaXNbaV0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cG9zdCA9IHRoaXNbaV0oc2NoZW1hLCBwb3N0KTtcblx0XHRcdH1cblx0XHR9LCB0aGlzKTtcblx0XHR0aGlzLl9jdXN0b21GaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAoaSkge1xuXHRcdFx0aWYgKGkgaW4gc2NoZW1hICYmIHR5cGVvZiB0aGlzLl9jdXN0b21baV0gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdFx0cG9zdCA9IHRoaXMuX2N1c3RvbVtpXS5jYWxsKHRoaXMsIHNjaGVtYSwgcG9zdCk7XG5cdFx0XHR9XG5cdFx0fSwgdGhpcyk7XG5cdFx0cmV0dXJuIHBvc3Q7XG5cdH07XG5cblx0U2FuaXRpemF0aW9uLnByb3RvdHlwZS5fYXN5bmNTYW5pdGl6ZSA9IGZ1bmN0aW9uIChzY2hlbWEsIHBvc3QsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdHRoaXMudXNlckFsaWFzID0gc2NoZW1hLmFsaWFzIHx8IG51bGw7XG5cblx0XHRhc3luYy53YXRlcmZhbGwoW1xuXHRcdFx0ZnVuY3Rpb24gKG5leHQpIHtcblx0XHRcdFx0YXN5bmMucmVkdWNlKHNlbGYuX2Jhc2ljRmllbGRzLCBwb3N0LCBmdW5jdGlvbiAodmFsdWUsIGksIG5leHQpIHtcblx0XHRcdFx0XHRhc3luYy5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpZiAoKGkgaW4gc2NoZW1hIHx8IGkgPT09ICdvcHRpb25hbCcpICYmIHR5cGVvZiBzZWxmW2ldID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzZWxmW2ldLmxlbmd0aCA+IDIpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VsZltpXShzY2hlbWEsIHZhbHVlLCBuZXh0KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR2YWx1ZSA9IHNlbGZbaV0oc2NoZW1hLCB2YWx1ZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRuZXh0KG51bGwsIHZhbHVlKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSwgbmV4dCk7XG5cdFx0XHR9LFxuXHRcdFx0ZnVuY3Rpb24gKGludGVyLCBuZXh0KSB7XG5cdFx0XHRcdGFzeW5jLnJlZHVjZShzZWxmLl9jdXN0b21GaWVsZHMsIGludGVyLCBmdW5jdGlvbiAodmFsdWUsIGksIG5leHQpIHtcblx0XHRcdFx0XHRhc3luYy5uZXh0VGljayhmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpZiAoaSBpbiBzY2hlbWEgJiYgdHlwZW9mIHNlbGYuX2N1c3RvbVtpXSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0XHRcdFx0XHRpZiAoc2VsZi5fY3VzdG9tW2ldLmxlbmd0aCA+IDIpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2VsZi5fY3VzdG9tW2ldLmNhbGwoc2VsZiwgc2NoZW1hLCB2YWx1ZSwgbmV4dCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0dmFsdWUgPSBzZWxmLl9jdXN0b21baV0uY2FsbChzZWxmLCBzY2hlbWEsIHZhbHVlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG5leHQobnVsbCwgdmFsdWUpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9LCBuZXh0KTtcblx0XHRcdH1cblx0XHRdLCBjYWxsYmFjayk7XG5cdH07XG5cblx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cblx0dmFyIElOVF9NSU4gPSAtMjE0NzQ4MzY0ODtcblx0dmFyIElOVF9NQVggPSAyMTQ3NDgzNjQ3O1xuXG5cdHZhciBfcmFuZCA9IHtcblx0XHRpbnQ6IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuXHRcdFx0cmV0dXJuIG1pbiArICgwIHwgTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG5cdFx0fSxcblx0XHRmbG9hdDogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG5cdFx0XHRyZXR1cm4gKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluKSArIG1pbik7XG5cdFx0fSxcblx0XHRib29sOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZXR1cm4gKE1hdGgucmFuZG9tKCkgPiAwLjUpO1xuXHRcdH0sXG5cdFx0Y2hhcjogZnVuY3Rpb24gKG1pbiwgbWF4KSB7XG5cdFx0XHRyZXR1cm4gU3RyaW5nLmZyb21DaGFyQ29kZSh0aGlzLmludChtaW4sIG1heCkpO1xuXHRcdH0sXG5cdFx0ZnJvbUxpc3Q6IGZ1bmN0aW9uIChsaXN0KSB7XG5cdFx0XHRyZXR1cm4gbGlzdFt0aGlzLmludCgwLCBsaXN0Lmxlbmd0aCAtIDEpXTtcblx0XHR9XG5cdH07XG5cblx0dmFyIF9mb3JtYXRTYW1wbGUgPSB7XG5cdFx0J2RhdGUtdGltZSc6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCk7XG5cdFx0fSxcblx0XHQnZGF0ZSc6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBuZXcgRGF0ZSgpLnRvSVNPU3RyaW5nKCkucmVwbGFjZSgvVC4qJC8sICcnKTtcblx0XHR9LFxuXHRcdCd0aW1lJzogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKCkudG9Mb2NhbGVUaW1lU3RyaW5nKHt9LCB7IGhvdXIxMjogZmFsc2UgfSk7XG5cdFx0fSxcblx0XHQnY29sb3InOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcblx0XHRcdHZhciBzID0gJyMnO1xuXHRcdFx0aWYgKG1pbiA8IDEpIHtcblx0XHRcdFx0bWluID0gMTtcblx0XHRcdH1cblx0XHRcdGZvciAodmFyIGkgPSAwLCBsID0gX3JhbmQuaW50KG1pbiwgbWF4KTsgaSA8IGw7IGkrKykge1xuXHRcdFx0XHRzICs9IF9yYW5kLmZyb21MaXN0KCcwMTIzNDU2Nzg5YWJjZGVmQUJDREVGJyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcztcblx0XHR9LFxuXHRcdCdudW1lcmljJzogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuICcnICsgX3JhbmQuaW50KDAsIElOVF9NQVgpO1xuXHRcdH0sXG5cdFx0J2ludGVnZXInOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoX3JhbmQuYm9vbCgpID09PSB0cnVlKSB7XG5cdFx0XHRcdHJldHVybiAnLScgKyB0aGlzLm51bWVyaWMoKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLm51bWVyaWMoKTtcblx0XHR9LFxuXHRcdCdkZWNpbWFsJzogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIHRoaXMuaW50ZWdlcigpICsgJy4nICsgdGhpcy5udW1lcmljKCk7XG5cdFx0fSxcblx0XHQnYWxwaGEnOiBmdW5jdGlvbiAobWluLCBtYXgpIHtcblx0XHRcdHZhciBzID0gJyc7XG5cdFx0XHRpZiAobWluIDwgMSkge1xuXHRcdFx0XHRtaW4gPSAxO1xuXHRcdFx0fVxuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBfcmFuZC5pbnQobWluLCBtYXgpOyBpIDwgbDsgaSsrKSB7XG5cdFx0XHRcdHMgKz0gX3JhbmQuZnJvbUxpc3QoJ2FiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzO1xuXHRcdH0sXG5cdFx0J2FscGhhTnVtZXJpYyc6IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuXHRcdFx0dmFyIHMgPSAnJztcblx0XHRcdGlmIChtaW4gPCAxKSB7XG5cdFx0XHRcdG1pbiA9IDE7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBpID0gMCwgbCA9IF9yYW5kLmludChtaW4sIG1heCk7IGkgPCBsOyBpKyspIHtcblx0XHRcdFx0cyArPSBfcmFuZC5mcm9tTGlzdCgnYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXpBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWjAxMjM0NTY3ODknKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzO1xuXHRcdH0sXG5cdFx0J2FscGhhRGFzaCc6IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuXHRcdFx0dmFyIHMgPSAnJztcblx0XHRcdGlmIChtaW4gPCAxKSB7XG5cdFx0XHRcdG1pbiA9IDE7XG5cdFx0XHR9XG5cdFx0XHRmb3IgKHZhciBpID0gMCwgbCA9IF9yYW5kLmludChtaW4sIG1heCk7IGkgPCBsOyBpKyspIHtcblx0XHRcdFx0cyArPSBfcmFuZC5mcm9tTGlzdCgnXy1hYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5el8tQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpfLTAxMjM0NTY3ODlfLScpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHM7XG5cdFx0fSxcblx0XHQnamF2YXNjcmlwdCc6IGZ1bmN0aW9uIChtaW4sIG1heCkge1xuXHRcdFx0dmFyIHMgPSBfcmFuZC5mcm9tTGlzdCgnXyRhYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5el8kQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVpfJCcpO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDAsIGwgPSBfcmFuZC5pbnQobWluLCBtYXggLSAxKTsgaSA8IGw7IGkrKykge1xuXHRcdFx0XHRzICs9IF9yYW5kLmZyb21MaXN0KCdfJGFiY2RlZmdoaWprbG1ub3BxcnN0dXZ3eHl6XyRBQkNERUZHSElKS0xNTk9QUVJTVFVWV1hZWl8kMDEyMzQ1Njc4OV8kJyk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gcztcblx0XHR9XG5cdH07XG5cblx0ZnVuY3Rpb24gX2dldExpbWl0cyhzY2hlbWEpIHtcblx0XHR2YXIgbWluID0gSU5UX01JTjtcblx0XHR2YXIgbWF4ID0gSU5UX01BWDtcblxuXHRcdGlmIChzY2hlbWEuZ3RlICE9IG51bGwpIHtcblx0XHRcdG1pbiA9IHNjaGVtYS5ndGU7XG5cdFx0fVxuXHRcdGVsc2UgaWYgKHNjaGVtYS5ndCAhPSBudWxsKSB7XG5cdFx0XHRtaW4gPSBzY2hlbWEuZ3QgKyAxO1xuXHRcdH1cblx0XHRpZiAoc2NoZW1hLmx0ZSAhPSBudWxsKSB7XG5cdFx0XHRtYXggPSBzY2hlbWEubHRlO1xuXHRcdH1cblx0XHRlbHNlIGlmIChzY2hlbWEubHQgIT0gbnVsbCkge1xuXHRcdFx0bWF4ID0gc2NoZW1hLmx0IC0gMTtcblx0XHR9XG5cdFx0cmV0dXJuIHsgbWluOiBtaW4sIG1heDogbWF4IH07XG5cdH1cblxuXHR2YXIgX3R5cGVHZW5lcmF0b3IgPSB7XG5cdFx0c3RyaW5nOiBmdW5jdGlvbiAoc2NoZW1hKSB7XG5cdFx0XHRpZiAoc2NoZW1hLmVxICE9IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIHNjaGVtYS5lcTtcblx0XHRcdH1cblx0XHRcdHZhciBzID0gJyc7XG5cdFx0XHR2YXIgbWluTGVuZ3RoID0gc2NoZW1hLm1pbkxlbmd0aCAhPSBudWxsID8gc2NoZW1hLm1pbkxlbmd0aCA6IDA7XG5cdFx0XHR2YXIgbWF4TGVuZ3RoID0gc2NoZW1hLm1heExlbmd0aCAhPSBudWxsID8gc2NoZW1hLm1heExlbmd0aCA6IDMyO1xuXHRcdFx0aWYgKHR5cGVvZiBzY2hlbWEucGF0dGVybiA9PT0gJ3N0cmluZycgJiYgdHlwZW9mIF9mb3JtYXRTYW1wbGVbc2NoZW1hLnBhdHRlcm5dID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0XHRcdHJldHVybiBfZm9ybWF0U2FtcGxlW3NjaGVtYS5wYXR0ZXJuXShtaW5MZW5ndGgsIG1heExlbmd0aCk7XG5cdFx0XHR9XG5cblx0XHRcdHZhciBsID0gc2NoZW1hLmV4YWN0TGVuZ3RoICE9IG51bGwgPyBzY2hlbWEuZXhhY3RMZW5ndGggOiBfcmFuZC5pbnQobWluTGVuZ3RoLCBtYXhMZW5ndGgpO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcblx0XHRcdFx0cyArPSBfcmFuZC5jaGFyKDMyLCAxMjYpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHM7XG5cdFx0fSxcblx0XHRudW1iZXI6IGZ1bmN0aW9uIChzY2hlbWEpIHtcblx0XHRcdGlmIChzY2hlbWEuZXEgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gc2NoZW1hLmVxO1xuXHRcdFx0fVxuXHRcdFx0dmFyIGxpbWl0ID0gX2dldExpbWl0cyhzY2hlbWEpO1xuXHRcdFx0dmFyIG4gPSBfcmFuZC5mbG9hdChsaW1pdC5taW4sIGxpbWl0Lm1heCk7XG5cdFx0XHRpZiAoc2NoZW1hLm5lICE9IG51bGwpIHtcblx0XHRcdFx0dmFyIG5lID0gX3R5cGVJcy5hcnJheShzY2hlbWEubmUpID8gc2NoZW1hLm5lIDogW3NjaGVtYS5uZV07XG5cdFx0XHRcdHdoaWxlIChuZS5pbmRleE9mKG4pICE9PSAtMSkge1xuXHRcdFx0XHRcdG4gPSBfcmFuZC5mbG9hdChsaW1pdC5taW4sIGxpbWl0Lm1heCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBuO1xuXHRcdH0sXG5cdFx0aW50ZWdlcjogZnVuY3Rpb24gKHNjaGVtYSkge1xuXHRcdFx0aWYgKHNjaGVtYS5lcSAhPSBudWxsKSB7XG5cdFx0XHRcdHJldHVybiBzY2hlbWEuZXE7XG5cdFx0XHR9XG5cdFx0XHR2YXIgbGltaXQgPSBfZ2V0TGltaXRzKHNjaGVtYSk7XG5cdFx0XHR2YXIgbiA9IF9yYW5kLmludChsaW1pdC5taW4sIGxpbWl0Lm1heCk7XG5cdFx0XHRpZiAoc2NoZW1hLm5lICE9IG51bGwpIHtcblx0XHRcdFx0dmFyIG5lID0gX3R5cGVJcy5hcnJheShzY2hlbWEubmUpID8gc2NoZW1hLm5lIDogW3NjaGVtYS5uZV07XG5cdFx0XHRcdHdoaWxlIChuZS5pbmRleE9mKG4pICE9PSAtMSkge1xuXHRcdFx0XHRcdG4gPSBfcmFuZC5pbnQobGltaXQubWluLCBsaW1pdC5tYXgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbjtcblx0XHR9LFxuXHRcdGJvb2xlYW46IGZ1bmN0aW9uIChzY2hlbWEpIHtcblx0XHRcdGlmIChzY2hlbWEuZXEgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gc2NoZW1hLmVxO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIF9yYW5kLmJvb2woKTtcblx0XHR9LFxuXHRcdFwibnVsbFwiOiBmdW5jdGlvbiAoc2NoZW1hKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9LFxuXHRcdGRhdGU6IGZ1bmN0aW9uIChzY2hlbWEpIHtcblx0XHRcdGlmIChzY2hlbWEuZXEgIT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gc2NoZW1hLmVxO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5ldyBEYXRlKCk7XG5cdFx0fSxcblx0XHRvYmplY3Q6IGZ1bmN0aW9uIChzY2hlbWEpIHtcblx0XHRcdHZhciBvID0ge307XG5cdFx0XHR2YXIgcHJvcCA9IHNjaGVtYS5wcm9wZXJ0aWVzIHx8IHt9O1xuXG5cdFx0XHRmb3IgKHZhciBrZXkgaW4gcHJvcCkge1xuXHRcdFx0XHRpZiAocHJvcC5oYXNPd25Qcm9wZXJ0eShrZXkpKXtcblx0XHRcdFx0XHRpZiAocHJvcFtrZXldLm9wdGlvbmFsID09PSB0cnVlICYmIF9yYW5kLmJvb2woKSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChrZXkgIT09ICcqJykge1xuXHRcdFx0XHRcdFx0b1trZXldID0gdGhpcy5nZW5lcmF0ZShwcm9wW2tleV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRlbHNlIHtcblx0XHRcdFx0XHRcdHZhciByayA9ICdfX3JhbmRvbV9rZXlfJztcblx0XHRcdFx0XHRcdHZhciByYW5kb21LZXkgPSByayArIDA7XG5cdFx0XHRcdFx0XHR2YXIgbiA9IF9yYW5kLmludCgxLCA5KTtcblx0XHRcdFx0XHRcdGZvciAodmFyIGkgPSAxOyBpIDw9IG47IGkrKykge1xuXHRcdFx0XHRcdFx0XHRpZiAoIShyYW5kb21LZXkgaW4gcHJvcCkpIHtcblx0XHRcdFx0XHRcdFx0XHRvW3JhbmRvbUtleV0gPSB0aGlzLmdlbmVyYXRlKHByb3Bba2V5XSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmFuZG9tS2V5ID0gcmsgKyBpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG87XG5cdFx0fSxcblx0XHRhcnJheTogZnVuY3Rpb24gKHNjaGVtYSkge1xuXHRcdFx0dmFyIHNlbGYgPSB0aGlzO1xuXHRcdFx0dmFyIGl0ZW1zID0gc2NoZW1hLml0ZW1zIHx8IHt9O1xuXHRcdFx0dmFyIG1pbkxlbmd0aCA9IHNjaGVtYS5taW5MZW5ndGggIT0gbnVsbCA/IHNjaGVtYS5taW5MZW5ndGggOiAwO1xuXHRcdFx0dmFyIG1heExlbmd0aCA9IHNjaGVtYS5tYXhMZW5ndGggIT0gbnVsbCA/IHNjaGVtYS5tYXhMZW5ndGggOiAxNjtcblx0XHRcdHZhciB0eXBlO1xuXHRcdFx0dmFyIGNhbmRpZGF0ZTtcblx0XHRcdHZhciBzaXplO1xuXHRcdFx0dmFyIGk7XG5cblx0XHRcdGlmIChfdHlwZUlzLmFycmF5KGl0ZW1zKSkge1xuXHRcdFx0XHRzaXplID0gaXRlbXMubGVuZ3RoO1xuXHRcdFx0XHRpZiAoc2NoZW1hLmV4YWN0TGVuZ3RoICE9IG51bGwpIHtcblx0XHRcdFx0XHRzaXplID0gc2NoZW1hLmV4YWN0TGVuZ3RoO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHNpemUgPCBtaW5MZW5ndGgpIHtcblx0XHRcdFx0XHRzaXplID0gbWluTGVuZ3RoO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGVsc2UgaWYgKHNpemUgPiBtYXhMZW5ndGgpIHtcblx0XHRcdFx0XHRzaXplID0gbWF4TGVuZ3RoO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNhbmRpZGF0ZSA9IG5ldyBBcnJheShzaXplKTtcblx0XHRcdFx0dHlwZSA9IG51bGw7XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcblx0XHRcdFx0XHR0eXBlID0gaXRlbXNbaV0udHlwZSB8fCAnYW55Jztcblx0XHRcdFx0XHRpZiAoX3R5cGVJcy5hcnJheSh0eXBlKSkge1xuXHRcdFx0XHRcdFx0dHlwZSA9IHR5cGVbX3JhbmQuaW50KDAsIHR5cGUubGVuZ3RoIC0gMSldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYW5kaWRhdGVbaV0gPSBzZWxmW3R5cGVdKGl0ZW1zW2ldKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdHNpemUgPSBzY2hlbWEuZXhhY3RMZW5ndGggIT0gbnVsbCA/IHNjaGVtYS5leGFjdExlbmd0aCA6IF9yYW5kLmludChtaW5MZW5ndGgsIG1heExlbmd0aCk7XG5cdFx0XHRcdGNhbmRpZGF0ZSA9IG5ldyBBcnJheShzaXplKTtcblx0XHRcdFx0dHlwZSA9IGl0ZW1zLnR5cGUgfHwgJ2FueSc7XG5cdFx0XHRcdGlmIChfdHlwZUlzLmFycmF5KHR5cGUpKSB7XG5cdFx0XHRcdFx0dHlwZSA9IHR5cGVbX3JhbmQuaW50KDAsIHR5cGUubGVuZ3RoIC0gMSldO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGZvciAoaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcblx0XHRcdFx0XHRjYW5kaWRhdGVbaV0gPSBzZWxmW3R5cGVdKGl0ZW1zKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNhbmRpZGF0ZTtcblx0XHR9LFxuXHRcdGFueTogZnVuY3Rpb24gKHNjaGVtYSkge1xuXHRcdFx0dmFyIGZpZWxkcyA9IE9iamVjdC5rZXlzKF90eXBlR2VuZXJhdG9yKTtcblx0XHRcdHZhciBpID0gZmllbGRzW19yYW5kLmludCgwLCBmaWVsZHMubGVuZ3RoIC0gMildO1xuXHRcdFx0cmV0dXJuIHRoaXNbaV0oc2NoZW1hKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQ2FuZGlkYXRlR2VuZXJhdG9yIENsYXNzIChTaW5nbGV0b24pIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cdGZ1bmN0aW9uIENhbmRpZGF0ZUdlbmVyYXRvcigpIHtcblx0XHQvLyBNYXliZSBleHRlbmRzIEluc3BlY3Rpb24gY2xhc3MgdG9vID9cblx0fVxuXG5cdF9leHRlbmQoQ2FuZGlkYXRlR2VuZXJhdG9yLnByb3RvdHlwZSwgX3R5cGVHZW5lcmF0b3IpO1xuXG5cdHZhciBfaW5zdGFuY2UgPSBudWxsO1xuXHRDYW5kaWRhdGVHZW5lcmF0b3IuaW5zdGFuY2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0aWYgKCEoX2luc3RhbmNlIGluc3RhbmNlb2YgQ2FuZGlkYXRlR2VuZXJhdG9yKSkge1xuXHRcdFx0X2luc3RhbmNlID0gbmV3IENhbmRpZGF0ZUdlbmVyYXRvcigpO1xuXHRcdH1cblx0XHRyZXR1cm4gX2luc3RhbmNlO1xuXHR9O1xuXG5cdENhbmRpZGF0ZUdlbmVyYXRvci5wcm90b3R5cGUuZ2VuZXJhdGUgPSBmdW5jdGlvbiAoc2NoZW1hKSB7XG5cdFx0dmFyIHR5cGUgPSBzY2hlbWEudHlwZSB8fCAnYW55Jztcblx0XHRpZiAoX3R5cGVJcy5hcnJheSh0eXBlKSkge1xuXHRcdFx0dHlwZSA9IHR5cGVbX3JhbmQuaW50KDAsIHR5cGUubGVuZ3RoIC0gMSldO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpc1t0eXBlXShzY2hlbWEpO1xuXHR9O1xuXG4vLyBFeHBvcnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHR2YXIgU2NoZW1hSW5zcGVjdG9yID0ge307XG5cblx0Ly8gaWYgc2VydmVyLXNpZGUgKG5vZGUuanMpIGVsc2UgY2xpZW50LXNpZGVcblx0aWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5cdFx0bW9kdWxlLmV4cG9ydHMgPSBTY2hlbWFJbnNwZWN0b3I7XG5cdH1cblx0ZWxzZSB7XG5cdFx0d2luZG93LlNjaGVtYUluc3BlY3RvciA9IFNjaGVtYUluc3BlY3Rvcjtcblx0fVxuXG5cdFNjaGVtYUluc3BlY3Rvci5uZXdTYW5pdGl6YXRpb24gPSBmdW5jdGlvbiAoc2NoZW1hLCBjdXN0b20pIHtcblx0XHRyZXR1cm4gbmV3IFNhbml0aXphdGlvbihzY2hlbWEsIGN1c3RvbSk7XG5cdH07XG5cblx0U2NoZW1hSW5zcGVjdG9yLm5ld1ZhbGlkYXRpb24gPSBmdW5jdGlvbiAoc2NoZW1hLCBjdXN0b20pIHtcblx0XHRyZXR1cm4gbmV3IFZhbGlkYXRpb24oc2NoZW1hLCBjdXN0b20pO1xuXHR9O1xuXG5cdFNjaGVtYUluc3BlY3Rvci5WYWxpZGF0aW9uID0gVmFsaWRhdGlvbjtcblx0U2NoZW1hSW5zcGVjdG9yLlNhbml0aXphdGlvbiA9IFNhbml0aXphdGlvbjtcblxuXHRTY2hlbWFJbnNwZWN0b3Iuc2FuaXRpemUgPSBmdW5jdGlvbiAoc2NoZW1hLCBwb3N0LCBjdXN0b20sIGNhbGxiYWNrKSB7XG5cdFx0aWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDMgJiYgdHlwZW9mIGN1c3RvbSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdFx0Y2FsbGJhY2sgPSBjdXN0b207XG5cdFx0XHRjdXN0b20gPSBudWxsO1xuXHRcdH1cblx0XHRyZXR1cm4gbmV3IFNhbml0aXphdGlvbihzY2hlbWEsIGN1c3RvbSkuc2FuaXRpemUocG9zdCwgY2FsbGJhY2spO1xuXHR9O1xuXG5cdFNjaGVtYUluc3BlY3Rvci52YWxpZGF0ZSA9IGZ1bmN0aW9uIChzY2hlbWEsIGNhbmRpZGF0ZSwgY3VzdG9tLCBjYWxsYmFjaykge1xuXHRcdGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzICYmIHR5cGVvZiBjdXN0b20gPT09ICdmdW5jdGlvbicpIHtcblx0XHRcdGNhbGxiYWNrID0gY3VzdG9tO1xuXHRcdFx0Y3VzdG9tID0gbnVsbDtcblx0XHR9XG5cdFx0cmV0dXJuIG5ldyBWYWxpZGF0aW9uKHNjaGVtYSwgY3VzdG9tKS52YWxpZGF0ZShjYW5kaWRhdGUsIGNhbGxiYWNrKTtcblx0fTtcblxuXHRTY2hlbWFJbnNwZWN0b3IuZ2VuZXJhdGUgPSBmdW5jdGlvbiAoc2NoZW1hLCBuKSB7XG5cdFx0aWYgKHR5cGVvZiBuID09PSAnbnVtYmVyJykge1xuXHRcdFx0dmFyIHIgPSBuZXcgQXJyYXkobik7XG5cdFx0XHRmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykge1xuXHRcdFx0XHRyW2ldID0gQ2FuZGlkYXRlR2VuZXJhdG9yLmluc3RhbmNlKCkuZ2VuZXJhdGUoc2NoZW1hKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiByO1xuXHRcdH1cblx0XHRyZXR1cm4gQ2FuZGlkYXRlR2VuZXJhdG9yLmluc3RhbmNlKCkuZ2VuZXJhdGUoc2NoZW1hKTtcblx0fTtcbn0pKCk7XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3MsZ2xvYmFsKXtcbi8qIVxuICogYXN5bmNcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9jYW9sYW4vYXN5bmNcbiAqXG4gKiBDb3B5cmlnaHQgMjAxMC0yMDE0IENhb2xhbiBNY01haG9uXG4gKiBSZWxlYXNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2VcbiAqL1xuKGZ1bmN0aW9uICgpIHtcblxuICAgIHZhciBhc3luYyA9IHt9O1xuICAgIGZ1bmN0aW9uIG5vb3AoKSB7fVxuICAgIGZ1bmN0aW9uIGlkZW50aXR5KHYpIHtcbiAgICAgICAgcmV0dXJuIHY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHRvQm9vbCh2KSB7XG4gICAgICAgIHJldHVybiAhIXY7XG4gICAgfVxuICAgIGZ1bmN0aW9uIG5vdElkKHYpIHtcbiAgICAgICAgcmV0dXJuICF2O1xuICAgIH1cblxuICAgIC8vIGdsb2JhbCBvbiB0aGUgc2VydmVyLCB3aW5kb3cgaW4gdGhlIGJyb3dzZXJcbiAgICB2YXIgcHJldmlvdXNfYXN5bmM7XG5cbiAgICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCAoYHNlbGZgKSBpbiB0aGUgYnJvd3NlciwgYGdsb2JhbGBcbiAgICAvLyBvbiB0aGUgc2VydmVyLCBvciBgdGhpc2AgaW4gc29tZSB2aXJ0dWFsIG1hY2hpbmVzLiBXZSB1c2UgYHNlbGZgXG4gICAgLy8gaW5zdGVhZCBvZiBgd2luZG93YCBmb3IgYFdlYldvcmtlcmAgc3VwcG9ydC5cbiAgICB2YXIgcm9vdCA9IHR5cGVvZiBzZWxmID09PSAnb2JqZWN0JyAmJiBzZWxmLnNlbGYgPT09IHNlbGYgJiYgc2VsZiB8fFxuICAgICAgICAgICAgdHlwZW9mIGdsb2JhbCA9PT0gJ29iamVjdCcgJiYgZ2xvYmFsLmdsb2JhbCA9PT0gZ2xvYmFsICYmIGdsb2JhbCB8fFxuICAgICAgICAgICAgdGhpcztcblxuICAgIGlmIChyb290ICE9IG51bGwpIHtcbiAgICAgICAgcHJldmlvdXNfYXN5bmMgPSByb290LmFzeW5jO1xuICAgIH1cblxuICAgIGFzeW5jLm5vQ29uZmxpY3QgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBwcmV2aW91c19hc3luYztcbiAgICAgICAgcmV0dXJuIGFzeW5jO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBvbmx5X29uY2UoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKGZuID09PSBudWxsKSB0aHJvdyBuZXcgRXJyb3IoXCJDYWxsYmFjayB3YXMgYWxyZWFkeSBjYWxsZWQuXCIpO1xuICAgICAgICAgICAgZm4uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgICAgIGZuID0gbnVsbDtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfb25jZShmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoZm4gPT09IG51bGwpIHJldHVybjtcbiAgICAgICAgICAgIGZuLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICBmbiA9IG51bGw7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBjcm9zcy1icm93c2VyIGNvbXBhdGlibGl0eSBmdW5jdGlvbnMgLy8vL1xuXG4gICAgdmFyIF90b1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbiAgICB2YXIgX2lzQXJyYXkgPSBBcnJheS5pc0FycmF5IHx8IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgICAgcmV0dXJuIF90b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgfTtcblxuICAgIC8vIFBvcnRlZCBmcm9tIHVuZGVyc2NvcmUuanMgaXNPYmplY3RcbiAgICB2YXIgX2lzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICAgICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9pc0FycmF5TGlrZShhcnIpIHtcbiAgICAgICAgcmV0dXJuIF9pc0FycmF5KGFycikgfHwgKFxuICAgICAgICAgICAgLy8gaGFzIGEgcG9zaXRpdmUgaW50ZWdlciBsZW5ndGggcHJvcGVydHlcbiAgICAgICAgICAgIHR5cGVvZiBhcnIubGVuZ3RoID09PSBcIm51bWJlclwiICYmXG4gICAgICAgICAgICBhcnIubGVuZ3RoID49IDAgJiZcbiAgICAgICAgICAgIGFyci5sZW5ndGggJSAxID09PSAwXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX2FycmF5RWFjaChhcnIsIGl0ZXJhdG9yKSB7XG4gICAgICAgIHZhciBpbmRleCA9IC0xLFxuICAgICAgICAgICAgbGVuZ3RoID0gYXJyLmxlbmd0aDtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgaXRlcmF0b3IoYXJyW2luZGV4XSwgaW5kZXgsIGFycik7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfbWFwKGFyciwgaXRlcmF0b3IpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gLTEsXG4gICAgICAgICAgICBsZW5ndGggPSBhcnIubGVuZ3RoLFxuICAgICAgICAgICAgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgICAgICB3aGlsZSAoKytpbmRleCA8IGxlbmd0aCkge1xuICAgICAgICAgICAgcmVzdWx0W2luZGV4XSA9IGl0ZXJhdG9yKGFycltpbmRleF0sIGluZGV4LCBhcnIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gX3JhbmdlKGNvdW50KSB7XG4gICAgICAgIHJldHVybiBfbWFwKEFycmF5KGNvdW50KSwgZnVuY3Rpb24gKHYsIGkpIHsgcmV0dXJuIGk7IH0pO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9yZWR1Y2UoYXJyLCBpdGVyYXRvciwgbWVtbykge1xuICAgICAgICBfYXJyYXlFYWNoKGFyciwgZnVuY3Rpb24gKHgsIGksIGEpIHtcbiAgICAgICAgICAgIG1lbW8gPSBpdGVyYXRvcihtZW1vLCB4LCBpLCBhKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIF9mb3JFYWNoT2Yob2JqZWN0LCBpdGVyYXRvcikge1xuICAgICAgICBfYXJyYXlFYWNoKF9rZXlzKG9iamVjdCksIGZ1bmN0aW9uIChrZXkpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG9iamVjdFtrZXldLCBrZXkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfaW5kZXhPZihhcnIsIGl0ZW0pIHtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGlmIChhcnJbaV0gPT09IGl0ZW0pIHJldHVybiBpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICB2YXIgX2tleXMgPSBPYmplY3Qua2V5cyB8fCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBrZXlzID0gW107XG4gICAgICAgIGZvciAodmFyIGsgaW4gb2JqKSB7XG4gICAgICAgICAgICBpZiAob2JqLmhhc093blByb3BlcnR5KGspKSB7XG4gICAgICAgICAgICAgICAga2V5cy5wdXNoKGspO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBrZXlzO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfa2V5SXRlcmF0b3IoY29sbCkge1xuICAgICAgICB2YXIgaSA9IC0xO1xuICAgICAgICB2YXIgbGVuO1xuICAgICAgICB2YXIga2V5cztcbiAgICAgICAgaWYgKF9pc0FycmF5TGlrZShjb2xsKSkge1xuICAgICAgICAgICAgbGVuID0gY29sbC5sZW5ndGg7XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gbmV4dCgpIHtcbiAgICAgICAgICAgICAgICBpKys7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGkgPCBsZW4gPyBpIDogbnVsbDtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBrZXlzID0gX2tleXMoY29sbCk7XG4gICAgICAgICAgICBsZW4gPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiBuZXh0KCkge1xuICAgICAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgICAgICByZXR1cm4gaSA8IGxlbiA/IGtleXNbaV0gOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIFNpbWlsYXIgdG8gRVM2J3MgcmVzdCBwYXJhbSAoaHR0cDovL2FyaXlhLm9maWxhYnMuY29tLzIwMTMvMDMvZXM2LWFuZC1yZXN0LXBhcmFtZXRlci5odG1sKVxuICAgIC8vIFRoaXMgYWNjdW11bGF0ZXMgdGhlIGFyZ3VtZW50cyBwYXNzZWQgaW50byBhbiBhcnJheSwgYWZ0ZXIgYSBnaXZlbiBpbmRleC5cbiAgICAvLyBGcm9tIHVuZGVyc2NvcmUuanMgKGh0dHBzOi8vZ2l0aHViLmNvbS9qYXNoa2VuYXMvdW5kZXJzY29yZS9wdWxsLzIxNDApLlxuICAgIGZ1bmN0aW9uIF9yZXN0UGFyYW0oZnVuYywgc3RhcnRJbmRleCkge1xuICAgICAgICBzdGFydEluZGV4ID0gc3RhcnRJbmRleCA9PSBudWxsID8gZnVuYy5sZW5ndGggLSAxIDogK3N0YXJ0SW5kZXg7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChhcmd1bWVudHMubGVuZ3RoIC0gc3RhcnRJbmRleCwgMCk7XG4gICAgICAgICAgICB2YXIgcmVzdCA9IEFycmF5KGxlbmd0aCk7XG4gICAgICAgICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgcmVzdFtpbmRleF0gPSBhcmd1bWVudHNbaW5kZXggKyBzdGFydEluZGV4XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHN3aXRjaCAoc3RhcnRJbmRleCkge1xuICAgICAgICAgICAgICAgIGNhc2UgMDogcmV0dXJuIGZ1bmMuY2FsbCh0aGlzLCByZXN0KTtcbiAgICAgICAgICAgICAgICBjYXNlIDE6IHJldHVybiBmdW5jLmNhbGwodGhpcywgYXJndW1lbnRzWzBdLCByZXN0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEN1cnJlbnRseSB1bnVzZWQgYnV0IGhhbmRsZSBjYXNlcyBvdXRzaWRlIG9mIHRoZSBzd2l0Y2ggc3RhdGVtZW50OlxuICAgICAgICAgICAgLy8gdmFyIGFyZ3MgPSBBcnJheShzdGFydEluZGV4ICsgMSk7XG4gICAgICAgICAgICAvLyBmb3IgKGluZGV4ID0gMDsgaW5kZXggPCBzdGFydEluZGV4OyBpbmRleCsrKSB7XG4gICAgICAgICAgICAvLyAgICAgYXJnc1tpbmRleF0gPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgLy8gYXJnc1tzdGFydEluZGV4XSA9IHJlc3Q7XG4gICAgICAgICAgICAvLyByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZXJhdG9yKHZhbHVlLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgLy8vLyBleHBvcnRlZCBhc3luYyBtb2R1bGUgZnVuY3Rpb25zIC8vLy9cblxuICAgIC8vLy8gbmV4dFRpY2sgaW1wbGVtZW50YXRpb24gd2l0aCBicm93c2VyLWNvbXBhdGlibGUgZmFsbGJhY2sgLy8vL1xuXG4gICAgLy8gY2FwdHVyZSB0aGUgZ2xvYmFsIHJlZmVyZW5jZSB0byBndWFyZCBhZ2FpbnN0IGZha2VUaW1lciBtb2Nrc1xuICAgIHZhciBfc2V0SW1tZWRpYXRlID0gdHlwZW9mIHNldEltbWVkaWF0ZSA9PT0gJ2Z1bmN0aW9uJyAmJiBzZXRJbW1lZGlhdGU7XG5cbiAgICB2YXIgX2RlbGF5ID0gX3NldEltbWVkaWF0ZSA/IGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgIC8vIG5vdCBhIGRpcmVjdCBhbGlhcyBmb3IgSUUxMCBjb21wYXRpYmlsaXR5XG4gICAgICAgIF9zZXRJbW1lZGlhdGUoZm4pO1xuICAgIH0gOiBmdW5jdGlvbihmbikge1xuICAgICAgICBzZXRUaW1lb3V0KGZuLCAwKTtcbiAgICB9O1xuXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgcHJvY2Vzcy5uZXh0VGljayA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBhc3luYy5uZXh0VGljayA9IHByb2Nlc3MubmV4dFRpY2s7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgYXN5bmMubmV4dFRpY2sgPSBfZGVsYXk7XG4gICAgfVxuICAgIGFzeW5jLnNldEltbWVkaWF0ZSA9IF9zZXRJbW1lZGlhdGUgPyBfZGVsYXkgOiBhc3luYy5uZXh0VGljaztcblxuXG4gICAgYXN5bmMuZm9yRWFjaCA9XG4gICAgYXN5bmMuZWFjaCA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMuZm9yRWFjaFNlcmllcyA9XG4gICAgYXN5bmMuZWFjaFNlcmllcyA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMuZWFjaE9mU2VyaWVzKGFyciwgX3dpdGhvdXRJbmRleChpdGVyYXRvciksIGNhbGxiYWNrKTtcbiAgICB9O1xuXG5cbiAgICBhc3luYy5mb3JFYWNoTGltaXQgPVxuICAgIGFzeW5jLmVhY2hMaW1pdCA9IGZ1bmN0aW9uIChhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIF9lYWNoT2ZMaW1pdChsaW1pdCkoYXJyLCBfd2l0aG91dEluZGV4KGl0ZXJhdG9yKSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5mb3JFYWNoT2YgPVxuICAgIGFzeW5jLmVhY2hPZiA9IGZ1bmN0aW9uIChvYmplY3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBvYmplY3QgPSBvYmplY3QgfHwgW107XG5cbiAgICAgICAgdmFyIGl0ZXIgPSBfa2V5SXRlcmF0b3Iob2JqZWN0KTtcbiAgICAgICAgdmFyIGtleSwgY29tcGxldGVkID0gMDtcblxuICAgICAgICB3aGlsZSAoKGtleSA9IGl0ZXIoKSkgIT0gbnVsbCkge1xuICAgICAgICAgICAgY29tcGxldGVkICs9IDE7XG4gICAgICAgICAgICBpdGVyYXRvcihvYmplY3Rba2V5XSwga2V5LCBvbmx5X29uY2UoZG9uZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGNvbXBsZXRlZCA9PT0gMCkgY2FsbGJhY2sobnVsbCk7XG5cbiAgICAgICAgZnVuY3Rpb24gZG9uZShlcnIpIHtcbiAgICAgICAgICAgIGNvbXBsZXRlZC0tO1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBDaGVjayBrZXkgaXMgbnVsbCBpbiBjYXNlIGl0ZXJhdG9yIGlzbid0IGV4aGF1c3RlZFxuICAgICAgICAgICAgLy8gYW5kIGRvbmUgcmVzb2x2ZWQgc3luY2hyb25vdXNseS5cbiAgICAgICAgICAgIGVsc2UgaWYgKGtleSA9PT0gbnVsbCAmJiBjb21wbGV0ZWQgPD0gMCkge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmZvckVhY2hPZlNlcmllcyA9XG4gICAgYXN5bmMuZWFjaE9mU2VyaWVzID0gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gX29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIG9iaiA9IG9iaiB8fCBbXTtcbiAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgdmFyIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZSgpIHtcbiAgICAgICAgICAgIHZhciBzeW5jID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChrZXkgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpdGVyYXRvcihvYmpba2V5XSwga2V5LCBvbmx5X29uY2UoZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGtleSA9IG5leHRLZXkoKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGtleSA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoaXRlcmF0ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZXJhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIHN5bmMgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICBpdGVyYXRlKCk7XG4gICAgfTtcblxuXG5cbiAgICBhc3luYy5mb3JFYWNoT2ZMaW1pdCA9XG4gICAgYXN5bmMuZWFjaE9mTGltaXQgPSBmdW5jdGlvbiAob2JqLCBsaW1pdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIF9lYWNoT2ZMaW1pdChsaW1pdCkob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfZWFjaE9mTGltaXQobGltaXQpIHtcblxuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICAgICAgb2JqID0gb2JqIHx8IFtdO1xuICAgICAgICAgICAgdmFyIG5leHRLZXkgPSBfa2V5SXRlcmF0b3Iob2JqKTtcbiAgICAgICAgICAgIGlmIChsaW1pdCA8PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdmFyIGRvbmUgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciBydW5uaW5nID0gMDtcbiAgICAgICAgICAgIHZhciBlcnJvcmVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgIChmdW5jdGlvbiByZXBsZW5pc2ggKCkge1xuICAgICAgICAgICAgICAgIGlmIChkb25lICYmIHJ1bm5pbmcgPD0gMCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgd2hpbGUgKHJ1bm5pbmcgPCBsaW1pdCAmJiAhZXJyb3JlZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIga2V5ID0gbmV4dEtleSgpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoa2V5ID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChydW5uaW5nIDw9IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBydW5uaW5nICs9IDE7XG4gICAgICAgICAgICAgICAgICAgIGl0ZXJhdG9yKG9ialtrZXldLCBrZXksIG9ubHlfb25jZShmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBydW5uaW5nIC09IDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlcGxlbmlzaCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkoKTtcbiAgICAgICAgfTtcbiAgICB9XG5cblxuICAgIGZ1bmN0aW9uIGRvUGFyYWxsZWwoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIGZuKGFzeW5jLmVhY2hPZiwgb2JqLCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgIH1cbiAgICBmdW5jdGlvbiBkb1BhcmFsbGVsTGltaXQoZm4pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uIChvYmosIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihfZWFjaE9mTGltaXQobGltaXQpLCBvYmosIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuICAgIGZ1bmN0aW9uIGRvU2VyaWVzKGZuKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAob2JqLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBmbihhc3luYy5lYWNoT2ZTZXJpZXMsIG9iaiwgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBfYXN5bmNNYXAoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBhcnIgPSBhcnIgfHwgW107XG4gICAgICAgIHZhciByZXN1bHRzID0gX2lzQXJyYXlMaWtlKGFycikgPyBbXSA6IHt9O1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAodmFsdWUsIGluZGV4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IodmFsdWUsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICByZXN1bHRzW2luZGV4XSA9IHY7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5tYXAgPSBkb1BhcmFsbGVsKF9hc3luY01hcCk7XG4gICAgYXN5bmMubWFwU2VyaWVzID0gZG9TZXJpZXMoX2FzeW5jTWFwKTtcbiAgICBhc3luYy5tYXBMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfYXN5bmNNYXApO1xuXG4gICAgLy8gcmVkdWNlIG9ubHkgaGFzIGEgc2VyaWVzIHZlcnNpb24sIGFzIGRvaW5nIHJlZHVjZSBpbiBwYXJhbGxlbCB3b24ndFxuICAgIC8vIHdvcmsgaW4gbWFueSBzaXR1YXRpb25zLlxuICAgIGFzeW5jLmluamVjdCA9XG4gICAgYXN5bmMuZm9sZGwgPVxuICAgIGFzeW5jLnJlZHVjZSA9IGZ1bmN0aW9uIChhcnIsIG1lbW8sIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5lYWNoT2ZTZXJpZXMoYXJyLCBmdW5jdGlvbiAoeCwgaSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG1lbW8sIHgsIGZ1bmN0aW9uIChlcnIsIHYpIHtcbiAgICAgICAgICAgICAgICBtZW1vID0gdjtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgbWVtbyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5mb2xkciA9XG4gICAgYXN5bmMucmVkdWNlUmlnaHQgPSBmdW5jdGlvbiAoYXJyLCBtZW1vLCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJldmVyc2VkID0gX21hcChhcnIsIGlkZW50aXR5KS5yZXZlcnNlKCk7XG4gICAgICAgIGFzeW5jLnJlZHVjZShyZXZlcnNlZCwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMudHJhbnNmb3JtID0gZnVuY3Rpb24gKGFyciwgbWVtbywgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICBjYWxsYmFjayA9IGl0ZXJhdG9yO1xuICAgICAgICAgICAgaXRlcmF0b3IgPSBtZW1vO1xuICAgICAgICAgICAgbWVtbyA9IF9pc0FycmF5KGFycikgPyBbXSA6IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgYXN5bmMuZWFjaE9mKGFyciwgZnVuY3Rpb24odiwgaywgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKG1lbW8sIHYsIGssIGNiKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIG1lbW8pO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2ZpbHRlcihlYWNoZm4sIGFyciwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIHZhciByZXN1bHRzID0gW107XG4gICAgICAgIGVhY2hmbihhcnIsIGZ1bmN0aW9uICh4LCBpbmRleCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHtpbmRleDogaW5kZXgsIHZhbHVlOiB4fSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY2FsbGJhY2soX21hcChyZXN1bHRzLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5pbmRleCAtIGIuaW5kZXg7XG4gICAgICAgICAgICB9KSwgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4geC52YWx1ZTtcbiAgICAgICAgICAgIH0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuc2VsZWN0ID1cbiAgICBhc3luYy5maWx0ZXIgPSBkb1BhcmFsbGVsKF9maWx0ZXIpO1xuXG4gICAgYXN5bmMuc2VsZWN0TGltaXQgPVxuICAgIGFzeW5jLmZpbHRlckxpbWl0ID0gZG9QYXJhbGxlbExpbWl0KF9maWx0ZXIpO1xuXG4gICAgYXN5bmMuc2VsZWN0U2VyaWVzID1cbiAgICBhc3luYy5maWx0ZXJTZXJpZXMgPSBkb1NlcmllcyhfZmlsdGVyKTtcblxuICAgIGZ1bmN0aW9uIF9yZWplY3QoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBfZmlsdGVyKGVhY2hmbiwgYXJyLCBmdW5jdGlvbih2YWx1ZSwgY2IpIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHZhbHVlLCBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgY2IoIXYpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgYXN5bmMucmVqZWN0ID0gZG9QYXJhbGxlbChfcmVqZWN0KTtcbiAgICBhc3luYy5yZWplY3RMaW1pdCA9IGRvUGFyYWxsZWxMaW1pdChfcmVqZWN0KTtcbiAgICBhc3luYy5yZWplY3RTZXJpZXMgPSBkb1NlcmllcyhfcmVqZWN0KTtcblxuICAgIGZ1bmN0aW9uIF9jcmVhdGVUZXN0ZXIoZWFjaGZuLCBjaGVjaywgZ2V0UmVzdWx0KSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbihhcnIsIGxpbWl0LCBpdGVyYXRvciwgY2IpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGRvbmUoKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNiKSBjYihnZXRSZXN1bHQoZmFsc2UsIHZvaWQgMCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gaXRlcmF0ZWUoeCwgXywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAoIWNiKSByZXR1cm4gY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcih4LCBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoY2IgJiYgY2hlY2sodikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNiKGdldFJlc3VsdCh0cnVlLCB4KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYiA9IGl0ZXJhdG9yID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMykge1xuICAgICAgICAgICAgICAgIGVhY2hmbihhcnIsIGxpbWl0LCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNiID0gaXRlcmF0b3I7XG4gICAgICAgICAgICAgICAgaXRlcmF0b3IgPSBsaW1pdDtcbiAgICAgICAgICAgICAgICBlYWNoZm4oYXJyLCBpdGVyYXRlZSwgZG9uZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMuYW55ID1cbiAgICBhc3luYy5zb21lID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIHRvQm9vbCwgaWRlbnRpdHkpO1xuXG4gICAgYXN5bmMuc29tZUxpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgdG9Cb29sLCBpZGVudGl0eSk7XG5cbiAgICBhc3luYy5hbGwgPVxuICAgIGFzeW5jLmV2ZXJ5ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2YsIG5vdElkLCBub3RJZCk7XG5cbiAgICBhc3luYy5ldmVyeUxpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgbm90SWQsIG5vdElkKTtcblxuICAgIGZ1bmN0aW9uIF9maW5kR2V0UmVzdWx0KHYsIHgpIHtcbiAgICAgICAgcmV0dXJuIHg7XG4gICAgfVxuICAgIGFzeW5jLmRldGVjdCA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mLCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuICAgIGFzeW5jLmRldGVjdFNlcmllcyA9IF9jcmVhdGVUZXN0ZXIoYXN5bmMuZWFjaE9mU2VyaWVzLCBpZGVudGl0eSwgX2ZpbmRHZXRSZXN1bHQpO1xuICAgIGFzeW5jLmRldGVjdExpbWl0ID0gX2NyZWF0ZVRlc3Rlcihhc3luYy5lYWNoT2ZMaW1pdCwgaWRlbnRpdHksIF9maW5kR2V0UmVzdWx0KTtcblxuICAgIGFzeW5jLnNvcnRCeSA9IGZ1bmN0aW9uIChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICBhc3luYy5tYXAoYXJyLCBmdW5jdGlvbiAoeCwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGl0ZXJhdG9yKHgsIGZ1bmN0aW9uIChlcnIsIGNyaXRlcmlhKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwge3ZhbHVlOiB4LCBjcml0ZXJpYTogY3JpdGVyaWF9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgX21hcChyZXN1bHRzLnNvcnQoY29tcGFyYXRvciksIGZ1bmN0aW9uICh4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB4LnZhbHVlO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9KTtcblxuICAgICAgICBmdW5jdGlvbiBjb21wYXJhdG9yKGxlZnQsIHJpZ2h0KSB7XG4gICAgICAgICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWEsIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgICAgICAgIHJldHVybiBhIDwgYiA/IC0xIDogYSA+IGIgPyAxIDogMDtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBhc3luYy5hdXRvID0gZnVuY3Rpb24gKHRhc2tzLCBjb25jdXJyZW5jeSwgY2FsbGJhY2spIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMV0gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIC8vIGNvbmN1cnJlbmN5IGlzIG9wdGlvbmFsLCBzaGlmdCB0aGUgYXJncy5cbiAgICAgICAgICAgIGNhbGxiYWNrID0gY29uY3VycmVuY3k7XG4gICAgICAgICAgICBjb25jdXJyZW5jeSA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2sgPSBfb25jZShjYWxsYmFjayB8fCBub29wKTtcbiAgICAgICAgdmFyIGtleXMgPSBfa2V5cyh0YXNrcyk7XG4gICAgICAgIHZhciByZW1haW5pbmdUYXNrcyA9IGtleXMubGVuZ3RoO1xuICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2sobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgY29uY3VycmVuY3kgPSByZW1haW5pbmdUYXNrcztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXN1bHRzID0ge307XG4gICAgICAgIHZhciBydW5uaW5nVGFza3MgPSAwO1xuXG4gICAgICAgIHZhciBoYXNFcnJvciA9IGZhbHNlO1xuXG4gICAgICAgIHZhciBsaXN0ZW5lcnMgPSBbXTtcbiAgICAgICAgZnVuY3Rpb24gYWRkTGlzdGVuZXIoZm4pIHtcbiAgICAgICAgICAgIGxpc3RlbmVycy51bnNoaWZ0KGZuKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihmbikge1xuICAgICAgICAgICAgdmFyIGlkeCA9IF9pbmRleE9mKGxpc3RlbmVycywgZm4pO1xuICAgICAgICAgICAgaWYgKGlkeCA+PSAwKSBsaXN0ZW5lcnMuc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gdGFza0NvbXBsZXRlKCkge1xuICAgICAgICAgICAgcmVtYWluaW5nVGFza3MtLTtcbiAgICAgICAgICAgIF9hcnJheUVhY2gobGlzdGVuZXJzLnNsaWNlKDApLCBmdW5jdGlvbiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbigpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBhZGRMaXN0ZW5lcihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoIXJlbWFpbmluZ1Rhc2tzKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIF9hcnJheUVhY2goa2V5cywgZnVuY3Rpb24gKGspIHtcbiAgICAgICAgICAgIGlmIChoYXNFcnJvcikgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHRhc2sgPSBfaXNBcnJheSh0YXNrc1trXSkgPyB0YXNrc1trXTogW3Rhc2tzW2tdXTtcbiAgICAgICAgICAgIHZhciB0YXNrQ2FsbGJhY2sgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIHJ1bm5pbmdUYXNrcy0tO1xuICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgIGFyZ3MgPSBhcmdzWzBdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBzYWZlUmVzdWx0cyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBfZm9yRWFjaE9mKHJlc3VsdHMsIGZ1bmN0aW9uKHZhbCwgcmtleSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2FmZVJlc3VsdHNbcmtleV0gPSB2YWw7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBzYWZlUmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgICAgIGhhc0Vycm9yID0gdHJ1ZTtcblxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIsIHNhZmVSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUodGFza0NvbXBsZXRlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciByZXF1aXJlcyA9IHRhc2suc2xpY2UoMCwgdGFzay5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIC8vIHByZXZlbnQgZGVhZC1sb2Nrc1xuICAgICAgICAgICAgdmFyIGxlbiA9IHJlcXVpcmVzLmxlbmd0aDtcbiAgICAgICAgICAgIHZhciBkZXA7XG4gICAgICAgICAgICB3aGlsZSAobGVuLS0pIHtcbiAgICAgICAgICAgICAgICBpZiAoIShkZXAgPSB0YXNrc1tyZXF1aXJlc1tsZW5dXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdIYXMgbm9uZXhpc3RlbnQgZGVwZW5kZW5jeSBpbiAnICsgcmVxdWlyZXMuam9pbignLCAnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChfaXNBcnJheShkZXApICYmIF9pbmRleE9mKGRlcCwgaykgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0hhcyBjeWNsaWMgZGVwZW5kZW5jaWVzJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZnVuY3Rpb24gcmVhZHkoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJ1bm5pbmdUYXNrcyA8IGNvbmN1cnJlbmN5ICYmIF9yZWR1Y2UocmVxdWlyZXMsIGZ1bmN0aW9uIChhLCB4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYSAmJiByZXN1bHRzLmhhc093blByb3BlcnR5KHgpKTtcbiAgICAgICAgICAgICAgICB9LCB0cnVlKSAmJiAhcmVzdWx0cy5oYXNPd25Qcm9wZXJ0eShrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChyZWFkeSgpKSB7XG4gICAgICAgICAgICAgICAgcnVubmluZ1Rhc2tzKys7XG4gICAgICAgICAgICAgICAgdGFza1t0YXNrLmxlbmd0aCAtIDFdKHRhc2tDYWxsYmFjaywgcmVzdWx0cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhZGRMaXN0ZW5lcihsaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmdW5jdGlvbiBsaXN0ZW5lcigpIHtcbiAgICAgICAgICAgICAgICBpZiAocmVhZHkoKSkge1xuICAgICAgICAgICAgICAgICAgICBydW5uaW5nVGFza3MrKztcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlTGlzdGVuZXIobGlzdGVuZXIpO1xuICAgICAgICAgICAgICAgICAgICB0YXNrW3Rhc2subGVuZ3RoIC0gMV0odGFza0NhbGxiYWNrLCByZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cblxuXG4gICAgYXN5bmMucmV0cnkgPSBmdW5jdGlvbih0aW1lcywgdGFzaywgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIERFRkFVTFRfVElNRVMgPSA1O1xuICAgICAgICB2YXIgREVGQVVMVF9JTlRFUlZBTCA9IDA7XG5cbiAgICAgICAgdmFyIGF0dGVtcHRzID0gW107XG5cbiAgICAgICAgdmFyIG9wdHMgPSB7XG4gICAgICAgICAgICB0aW1lczogREVGQVVMVF9USU1FUyxcbiAgICAgICAgICAgIGludGVydmFsOiBERUZBVUxUX0lOVEVSVkFMXG4gICAgICAgIH07XG5cbiAgICAgICAgZnVuY3Rpb24gcGFyc2VUaW1lcyhhY2MsIHQpe1xuICAgICAgICAgICAgaWYodHlwZW9mIHQgPT09ICdudW1iZXInKXtcbiAgICAgICAgICAgICAgICBhY2MudGltZXMgPSBwYXJzZUludCh0LCAxMCkgfHwgREVGQVVMVF9USU1FUztcbiAgICAgICAgICAgIH0gZWxzZSBpZih0eXBlb2YgdCA9PT0gJ29iamVjdCcpe1xuICAgICAgICAgICAgICAgIGFjYy50aW1lcyA9IHBhcnNlSW50KHQudGltZXMsIDEwKSB8fCBERUZBVUxUX1RJTUVTO1xuICAgICAgICAgICAgICAgIGFjYy5pbnRlcnZhbCA9IHBhcnNlSW50KHQuaW50ZXJ2YWwsIDEwKSB8fCBERUZBVUxUX0lOVEVSVkFMO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1Vuc3VwcG9ydGVkIGFyZ3VtZW50IHR5cGUgZm9yIFxcJ3RpbWVzXFwnOiAnICsgdHlwZW9mIHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICAgIGlmIChsZW5ndGggPCAxIHx8IGxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBhcmd1bWVudHMgLSBtdXN0IGJlIGVpdGhlciAodGFzayksICh0YXNrLCBjYWxsYmFjayksICh0aW1lcywgdGFzaykgb3IgKHRpbWVzLCB0YXNrLCBjYWxsYmFjayknKTtcbiAgICAgICAgfSBlbHNlIGlmIChsZW5ndGggPD0gMiAmJiB0eXBlb2YgdGltZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gdGFzaztcbiAgICAgICAgICAgIHRhc2sgPSB0aW1lcztcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHRpbWVzICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBwYXJzZVRpbWVzKG9wdHMsIHRpbWVzKTtcbiAgICAgICAgfVxuICAgICAgICBvcHRzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgICAgIG9wdHMudGFzayA9IHRhc2s7XG5cbiAgICAgICAgZnVuY3Rpb24gd3JhcHBlZFRhc2sod3JhcHBlZENhbGxiYWNrLCB3cmFwcGVkUmVzdWx0cykge1xuICAgICAgICAgICAgZnVuY3Rpb24gcmV0cnlBdHRlbXB0KHRhc2ssIGZpbmFsQXR0ZW1wdCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbihzZXJpZXNDYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICB0YXNrKGZ1bmN0aW9uKGVyciwgcmVzdWx0KXtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlcmllc0NhbGxiYWNrKCFlcnIgfHwgZmluYWxBdHRlbXB0LCB7ZXJyOiBlcnIsIHJlc3VsdDogcmVzdWx0fSk7XG4gICAgICAgICAgICAgICAgICAgIH0sIHdyYXBwZWRSZXN1bHRzKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiByZXRyeUludGVydmFsKGludGVydmFsKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24oc2VyaWVzQ2FsbGJhY2spe1xuICAgICAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZXJpZXNDYWxsYmFjayhudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgaW50ZXJ2YWwpO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHdoaWxlIChvcHRzLnRpbWVzKSB7XG5cbiAgICAgICAgICAgICAgICB2YXIgZmluYWxBdHRlbXB0ID0gIShvcHRzLnRpbWVzLT0xKTtcbiAgICAgICAgICAgICAgICBhdHRlbXB0cy5wdXNoKHJldHJ5QXR0ZW1wdChvcHRzLnRhc2ssIGZpbmFsQXR0ZW1wdCkpO1xuICAgICAgICAgICAgICAgIGlmKCFmaW5hbEF0dGVtcHQgJiYgb3B0cy5pbnRlcnZhbCA+IDApe1xuICAgICAgICAgICAgICAgICAgICBhdHRlbXB0cy5wdXNoKHJldHJ5SW50ZXJ2YWwob3B0cy5pbnRlcnZhbCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXN5bmMuc2VyaWVzKGF0dGVtcHRzLCBmdW5jdGlvbihkb25lLCBkYXRhKXtcbiAgICAgICAgICAgICAgICBkYXRhID0gZGF0YVtkYXRhLmxlbmd0aCAtIDFdO1xuICAgICAgICAgICAgICAgICh3cmFwcGVkQ2FsbGJhY2sgfHwgb3B0cy5jYWxsYmFjaykoZGF0YS5lcnIsIGRhdGEucmVzdWx0KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgYSBjYWxsYmFjayBpcyBwYXNzZWQsIHJ1biB0aGlzIGFzIGEgY29udHJvbGwgZmxvd1xuICAgICAgICByZXR1cm4gb3B0cy5jYWxsYmFjayA/IHdyYXBwZWRUYXNrKCkgOiB3cmFwcGVkVGFzaztcbiAgICB9O1xuXG4gICAgYXN5bmMud2F0ZXJmYWxsID0gZnVuY3Rpb24gKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IF9vbmNlKGNhbGxiYWNrIHx8IG5vb3ApO1xuICAgICAgICBpZiAoIV9pc0FycmF5KHRhc2tzKSkge1xuICAgICAgICAgICAgdmFyIGVyciA9IG5ldyBFcnJvcignRmlyc3QgYXJndW1lbnQgdG8gd2F0ZXJmYWxsIG11c3QgYmUgYW4gYXJyYXkgb2YgZnVuY3Rpb25zJyk7XG4gICAgICAgICAgICByZXR1cm4gY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRhc2tzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gd3JhcEl0ZXJhdG9yKGl0ZXJhdG9yKSB7XG4gICAgICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBbZXJyXS5jb25jYXQoYXJncykpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG5leHQgPSBpdGVyYXRvci5uZXh0KCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzLnB1c2god3JhcEl0ZXJhdG9yKG5leHQpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFyZ3MucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZW5zdXJlQXN5bmMoaXRlcmF0b3IpLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHdyYXBJdGVyYXRvcihhc3luYy5pdGVyYXRvcih0YXNrcykpKCk7XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIF9wYXJhbGxlbChlYWNoZm4sIHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBjYWxsYmFjayA9IGNhbGxiYWNrIHx8IG5vb3A7XG4gICAgICAgIHZhciByZXN1bHRzID0gX2lzQXJyYXlMaWtlKHRhc2tzKSA/IFtdIDoge307XG5cbiAgICAgICAgZWFjaGZuKHRhc2tzLCBmdW5jdGlvbiAodGFzaywga2V5LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgdGFzayhfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0c1trZXldID0gYXJncztcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSkpO1xuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBhc3luYy5wYXJhbGxlbCA9IGZ1bmN0aW9uICh0YXNrcywgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKGFzeW5jLmVhY2hPZiwgdGFza3MsIGNhbGxiYWNrKTtcbiAgICB9O1xuXG4gICAgYXN5bmMucGFyYWxsZWxMaW1pdCA9IGZ1bmN0aW9uKHRhc2tzLCBsaW1pdCwgY2FsbGJhY2spIHtcbiAgICAgICAgX3BhcmFsbGVsKF9lYWNoT2ZMaW1pdChsaW1pdCksIHRhc2tzLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnNlcmllcyA9IGZ1bmN0aW9uKHRhc2tzLCBjYWxsYmFjaykge1xuICAgICAgICBfcGFyYWxsZWwoYXN5bmMuZWFjaE9mU2VyaWVzLCB0YXNrcywgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5pdGVyYXRvciA9IGZ1bmN0aW9uICh0YXNrcykge1xuICAgICAgICBmdW5jdGlvbiBtYWtlQ2FsbGJhY2soaW5kZXgpIHtcbiAgICAgICAgICAgIGZ1bmN0aW9uIGZuKCkge1xuICAgICAgICAgICAgICAgIGlmICh0YXNrcy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgdGFza3NbaW5kZXhdLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBmbi5uZXh0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBmbi5uZXh0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiAoaW5kZXggPCB0YXNrcy5sZW5ndGggLSAxKSA/IG1ha2VDYWxsYmFjayhpbmRleCArIDEpOiBudWxsO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBmbjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWFrZUNhbGxiYWNrKDApO1xuICAgIH07XG5cbiAgICBhc3luYy5hcHBseSA9IF9yZXN0UGFyYW0oZnVuY3Rpb24gKGZuLCBhcmdzKSB7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChjYWxsQXJncykge1xuICAgICAgICAgICAgcmV0dXJuIGZuLmFwcGx5KFxuICAgICAgICAgICAgICAgIG51bGwsIGFyZ3MuY29uY2F0KGNhbGxBcmdzKVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICBmdW5jdGlvbiBfY29uY2F0KGVhY2hmbiwgYXJyLCBmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbiAoeCwgaW5kZXgsIGNiKSB7XG4gICAgICAgICAgICBmbih4LCBmdW5jdGlvbiAoZXJyLCB5KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gcmVzdWx0LmNvbmNhdCh5IHx8IFtdKTtcbiAgICAgICAgICAgICAgICBjYihlcnIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jLmNvbmNhdCA9IGRvUGFyYWxsZWwoX2NvbmNhdCk7XG4gICAgYXN5bmMuY29uY2F0U2VyaWVzID0gZG9TZXJpZXMoX2NvbmNhdCk7XG5cbiAgICBhc3luYy53aGlsc3QgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcbiAgICAgICAgaWYgKHRlc3QoKSkge1xuICAgICAgICAgICAgdmFyIG5leHQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGVyciwgYXJncykge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRlc3QuYXBwbHkodGhpcywgYXJncykpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0b3IobmV4dCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkobnVsbCwgW251bGxdLmNvbmNhdChhcmdzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIGFzeW5jLmRvV2hpbHN0ID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2FsbHMgPSAwO1xuICAgICAgICByZXR1cm4gYXN5bmMud2hpbHN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICsrY2FsbHMgPD0gMSB8fCB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLnVudGlsID0gZnVuY3Rpb24gKHRlc3QsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICByZXR1cm4gYXN5bmMud2hpbHN0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICF0ZXN0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIH0sIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmRvVW50aWwgPSBmdW5jdGlvbiAoaXRlcmF0b3IsIHRlc3QsIGNhbGxiYWNrKSB7XG4gICAgICAgIHJldHVybiBhc3luYy5kb1doaWxzdChpdGVyYXRvciwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIXRlc3QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgICAgfSwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5kdXJpbmcgPSBmdW5jdGlvbiAodGVzdCwgaXRlcmF0b3IsIGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgbm9vcDtcblxuICAgICAgICB2YXIgbmV4dCA9IF9yZXN0UGFyYW0oZnVuY3Rpb24oZXJyLCBhcmdzKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYXJncy5wdXNoKGNoZWNrKTtcbiAgICAgICAgICAgICAgICB0ZXN0LmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICB2YXIgY2hlY2sgPSBmdW5jdGlvbihlcnIsIHRydXRoKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodHJ1dGgpIHtcbiAgICAgICAgICAgICAgICBpdGVyYXRvcihuZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGVzdChjaGVjayk7XG4gICAgfTtcblxuICAgIGFzeW5jLmRvRHVyaW5nID0gZnVuY3Rpb24gKGl0ZXJhdG9yLCB0ZXN0LCBjYWxsYmFjaykge1xuICAgICAgICB2YXIgY2FsbHMgPSAwO1xuICAgICAgICBhc3luYy5kdXJpbmcoZnVuY3Rpb24obmV4dCkge1xuICAgICAgICAgICAgaWYgKGNhbGxzKysgPCAxKSB7XG4gICAgICAgICAgICAgICAgbmV4dChudWxsLCB0cnVlKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGVzdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfcXVldWUod29ya2VyLCBjb25jdXJyZW5jeSwgcGF5bG9hZCkge1xuICAgICAgICBpZiAoY29uY3VycmVuY3kgPT0gbnVsbCkge1xuICAgICAgICAgICAgY29uY3VycmVuY3kgPSAxO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYoY29uY3VycmVuY3kgPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29uY3VycmVuY3kgbXVzdCBub3QgYmUgemVybycpO1xuICAgICAgICB9XG4gICAgICAgIGZ1bmN0aW9uIF9pbnNlcnQocSwgZGF0YSwgcG9zLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0YXNrIGNhbGxiYWNrIG11c3QgYmUgYSBmdW5jdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHEuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIV9pc0FycmF5KGRhdGEpKSB7XG4gICAgICAgICAgICAgICAgZGF0YSA9IFtkYXRhXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmKGRhdGEubGVuZ3RoID09PSAwICYmIHEuaWRsZSgpKSB7XG4gICAgICAgICAgICAgICAgLy8gY2FsbCBkcmFpbiBpbW1lZGlhdGVseSBpZiB0aGVyZSBhcmUgbm8gdGFza3NcbiAgICAgICAgICAgICAgICByZXR1cm4gYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBxLmRyYWluKCk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfYXJyYXlFYWNoKGRhdGEsIGZ1bmN0aW9uKHRhc2spIHtcbiAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogdGFzayxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrIHx8IG5vb3BcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgaWYgKHBvcykge1xuICAgICAgICAgICAgICAgICAgICBxLnRhc2tzLnVuc2hpZnQoaXRlbSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gcS5jb25jdXJyZW5jeSkge1xuICAgICAgICAgICAgICAgICAgICBxLnNhdHVyYXRlZCgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gX25leHQocSwgdGFza3MpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgICAgIHdvcmtlcnMgLT0gMTtcblxuICAgICAgICAgICAgICAgIHZhciByZW1vdmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgX2FycmF5RWFjaCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgX2FycmF5RWFjaCh3b3JrZXJzTGlzdCwgZnVuY3Rpb24gKHdvcmtlciwgaW5kZXgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh3b3JrZXIgPT09IHRhc2sgJiYgIXJlbW92ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB3b3JrZXJzTGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbW92ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICAgICB0YXNrLmNhbGxiYWNrLmFwcGx5KHRhc2ssIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBxLnByb2Nlc3MoKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgd29ya2VycyA9IDA7XG4gICAgICAgIHZhciB3b3JrZXJzTGlzdCA9IFtdO1xuICAgICAgICB2YXIgcSA9IHtcbiAgICAgICAgICAgIHRhc2tzOiBbXSxcbiAgICAgICAgICAgIGNvbmN1cnJlbmN5OiBjb25jdXJyZW5jeSxcbiAgICAgICAgICAgIHBheWxvYWQ6IHBheWxvYWQsXG4gICAgICAgICAgICBzYXR1cmF0ZWQ6IG5vb3AsXG4gICAgICAgICAgICBlbXB0eTogbm9vcCxcbiAgICAgICAgICAgIGRyYWluOiBub29wLFxuICAgICAgICAgICAgc3RhcnRlZDogZmFsc2UsXG4gICAgICAgICAgICBwYXVzZWQ6IGZhbHNlLFxuICAgICAgICAgICAgcHVzaDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCBmYWxzZSwgY2FsbGJhY2spO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGtpbGw6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLmRyYWluID0gbm9vcDtcbiAgICAgICAgICAgICAgICBxLnRhc2tzID0gW107XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdW5zaGlmdDogZnVuY3Rpb24gKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgX2luc2VydChxLCBkYXRhLCB0cnVlLCBjYWxsYmFjayk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHdoaWxlKCFxLnBhdXNlZCAmJiB3b3JrZXJzIDwgcS5jb25jdXJyZW5jeSAmJiBxLnRhc2tzLmxlbmd0aCl7XG5cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRhc2tzID0gcS5wYXlsb2FkID9cbiAgICAgICAgICAgICAgICAgICAgICAgIHEudGFza3Muc3BsaWNlKDAsIHEucGF5bG9hZCkgOlxuICAgICAgICAgICAgICAgICAgICAgICAgcS50YXNrcy5zcGxpY2UoMCwgcS50YXNrcy5sZW5ndGgpO1xuXG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXRhID0gX21hcCh0YXNrcywgZnVuY3Rpb24gKHRhc2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0YXNrLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmIChxLnRhc2tzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcS5lbXB0eSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHdvcmtlcnMgKz0gMTtcbiAgICAgICAgICAgICAgICAgICAgd29ya2Vyc0xpc3QucHVzaCh0YXNrc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjYiA9IG9ubHlfb25jZShfbmV4dChxLCB0YXNrcykpO1xuICAgICAgICAgICAgICAgICAgICB3b3JrZXIoZGF0YSwgY2IpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsZW5ndGg6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcS50YXNrcy5sZW5ndGg7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcnVubmluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB3b3JrZXJzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHdvcmtlcnNMaXN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlcnNMaXN0O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlkbGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBxLnRhc2tzLmxlbmd0aCArIHdvcmtlcnMgPT09IDA7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcGF1c2U6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IHRydWU7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVzdW1lOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgaWYgKHEucGF1c2VkID09PSBmYWxzZSkgeyByZXR1cm47IH1cbiAgICAgICAgICAgICAgICBxLnBhdXNlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bWVDb3VudCA9IE1hdGgubWluKHEuY29uY3VycmVuY3ksIHEudGFza3MubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAvLyBOZWVkIHRvIGNhbGwgcS5wcm9jZXNzIG9uY2UgcGVyIGNvbmN1cnJlbnRcbiAgICAgICAgICAgICAgICAvLyB3b3JrZXIgdG8gcHJlc2VydmUgZnVsbCBjb25jdXJyZW5jeSBhZnRlciBwYXVzZVxuICAgICAgICAgICAgICAgIGZvciAodmFyIHcgPSAxOyB3IDw9IHJlc3VtZUNvdW50OyB3KyspIHtcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4gcTtcbiAgICB9XG5cbiAgICBhc3luYy5xdWV1ZSA9IGZ1bmN0aW9uICh3b3JrZXIsIGNvbmN1cnJlbmN5KSB7XG4gICAgICAgIHZhciBxID0gX3F1ZXVlKGZ1bmN0aW9uIChpdGVtcywgY2IpIHtcbiAgICAgICAgICAgIHdvcmtlcihpdGVtc1swXSwgY2IpO1xuICAgICAgICB9LCBjb25jdXJyZW5jeSwgMSk7XG5cbiAgICAgICAgcmV0dXJuIHE7XG4gICAgfTtcblxuICAgIGFzeW5jLnByaW9yaXR5UXVldWUgPSBmdW5jdGlvbiAod29ya2VyLCBjb25jdXJyZW5jeSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIF9jb21wYXJlVGFza3MoYSwgYil7XG4gICAgICAgICAgICByZXR1cm4gYS5wcmlvcml0eSAtIGIucHJpb3JpdHk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBfYmluYXJ5U2VhcmNoKHNlcXVlbmNlLCBpdGVtLCBjb21wYXJlKSB7XG4gICAgICAgICAgICB2YXIgYmVnID0gLTEsXG4gICAgICAgICAgICAgICAgZW5kID0gc2VxdWVuY2UubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIHdoaWxlIChiZWcgPCBlbmQpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWlkID0gYmVnICsgKChlbmQgLSBiZWcgKyAxKSA+Pj4gMSk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBhcmUoaXRlbSwgc2VxdWVuY2VbbWlkXSkgPj0gMCkge1xuICAgICAgICAgICAgICAgICAgICBiZWcgPSBtaWQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZW5kID0gbWlkIC0gMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gYmVnO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gX2luc2VydChxLCBkYXRhLCBwcmlvcml0eSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwidGFzayBjYWxsYmFjayBtdXN0IGJlIGEgZnVuY3Rpb25cIik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBxLnN0YXJ0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCFfaXNBcnJheShkYXRhKSkge1xuICAgICAgICAgICAgICAgIGRhdGEgPSBbZGF0YV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZihkYXRhLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIC8vIGNhbGwgZHJhaW4gaW1tZWRpYXRlbHkgaWYgdGhlcmUgYXJlIG5vIHRhc2tzXG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jLnNldEltbWVkaWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5kcmFpbigpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgX2FycmF5RWFjaChkYXRhLCBmdW5jdGlvbih0YXNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGl0ZW0gPSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHRhc2ssXG4gICAgICAgICAgICAgICAgICAgIHByaW9yaXR5OiBwcmlvcml0eSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2s6IHR5cGVvZiBjYWxsYmFjayA9PT0gJ2Z1bmN0aW9uJyA/IGNhbGxiYWNrIDogbm9vcFxuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICBxLnRhc2tzLnNwbGljZShfYmluYXJ5U2VhcmNoKHEudGFza3MsIGl0ZW0sIF9jb21wYXJlVGFza3MpICsgMSwgMCwgaXRlbSk7XG5cbiAgICAgICAgICAgICAgICBpZiAocS50YXNrcy5sZW5ndGggPT09IHEuY29uY3VycmVuY3kpIHtcbiAgICAgICAgICAgICAgICAgICAgcS5zYXR1cmF0ZWQoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKHEucHJvY2Vzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFN0YXJ0IHdpdGggYSBub3JtYWwgcXVldWVcbiAgICAgICAgdmFyIHEgPSBhc3luYy5xdWV1ZSh3b3JrZXIsIGNvbmN1cnJlbmN5KTtcblxuICAgICAgICAvLyBPdmVycmlkZSBwdXNoIHRvIGFjY2VwdCBzZWNvbmQgcGFyYW1ldGVyIHJlcHJlc2VudGluZyBwcmlvcml0eVxuICAgICAgICBxLnB1c2ggPSBmdW5jdGlvbiAoZGF0YSwgcHJpb3JpdHksIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBfaW5zZXJ0KHEsIGRhdGEsIHByaW9yaXR5LCBjYWxsYmFjayk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUmVtb3ZlIHVuc2hpZnQgZnVuY3Rpb25cbiAgICAgICAgZGVsZXRlIHEudW5zaGlmdDtcblxuICAgICAgICByZXR1cm4gcTtcbiAgICB9O1xuXG4gICAgYXN5bmMuY2FyZ28gPSBmdW5jdGlvbiAod29ya2VyLCBwYXlsb2FkKSB7XG4gICAgICAgIHJldHVybiBfcXVldWUod29ya2VyLCAxLCBwYXlsb2FkKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gX2NvbnNvbGVfZm4obmFtZSkge1xuICAgICAgICByZXR1cm4gX3Jlc3RQYXJhbShmdW5jdGlvbiAoZm4sIGFyZ3MpIHtcbiAgICAgICAgICAgIGZuLmFwcGx5KG51bGwsIGFyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIGFyZ3MpIHtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbnNvbGUgPT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb25zb2xlLmVycm9yKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2UgaWYgKGNvbnNvbGVbbmFtZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hcnJheUVhY2goYXJncywgZnVuY3Rpb24gKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlW25hbWVdKHgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KV0pKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFzeW5jLmxvZyA9IF9jb25zb2xlX2ZuKCdsb2cnKTtcbiAgICBhc3luYy5kaXIgPSBfY29uc29sZV9mbignZGlyJyk7XG4gICAgLyphc3luYy5pbmZvID0gX2NvbnNvbGVfZm4oJ2luZm8nKTtcbiAgICBhc3luYy53YXJuID0gX2NvbnNvbGVfZm4oJ3dhcm4nKTtcbiAgICBhc3luYy5lcnJvciA9IF9jb25zb2xlX2ZuKCdlcnJvcicpOyovXG5cbiAgICBhc3luYy5tZW1vaXplID0gZnVuY3Rpb24gKGZuLCBoYXNoZXIpIHtcbiAgICAgICAgdmFyIG1lbW8gPSB7fTtcbiAgICAgICAgdmFyIHF1ZXVlcyA9IHt9O1xuICAgICAgICB2YXIgaGFzID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbiAgICAgICAgaGFzaGVyID0gaGFzaGVyIHx8IGlkZW50aXR5O1xuICAgICAgICB2YXIgbWVtb2l6ZWQgPSBfcmVzdFBhcmFtKGZ1bmN0aW9uIG1lbW9pemVkKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIga2V5ID0gaGFzaGVyLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgaWYgKGhhcy5jYWxsKG1lbW8sIGtleSkpIHsgICBcbiAgICAgICAgICAgICAgICBhc3luYy5zZXRJbW1lZGlhdGUoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBtZW1vW2tleV0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoaGFzLmNhbGwocXVldWVzLCBrZXkpKSB7XG4gICAgICAgICAgICAgICAgcXVldWVzW2tleV0ucHVzaChjYWxsYmFjayk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBxdWV1ZXNba2V5XSA9IFtjYWxsYmFja107XG4gICAgICAgICAgICAgICAgZm4uYXBwbHkobnVsbCwgYXJncy5jb25jYXQoW19yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVtb1trZXldID0gYXJncztcbiAgICAgICAgICAgICAgICAgICAgdmFyIHEgPSBxdWV1ZXNba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHF1ZXVlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMCwgbCA9IHEubGVuZ3RoOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBxW2ldLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSldKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBtZW1vaXplZC5tZW1vID0gbWVtbztcbiAgICAgICAgbWVtb2l6ZWQudW5tZW1vaXplZCA9IGZuO1xuICAgICAgICByZXR1cm4gbWVtb2l6ZWQ7XG4gICAgfTtcblxuICAgIGFzeW5jLnVubWVtb2l6ZSA9IGZ1bmN0aW9uIChmbikge1xuICAgICAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIChmbi51bm1lbW9pemVkIHx8IGZuKS5hcHBseShudWxsLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH07XG5cbiAgICBmdW5jdGlvbiBfdGltZXMobWFwcGVyKSB7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoY291bnQsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgbWFwcGVyKF9yYW5nZShjb3VudCksIGl0ZXJhdG9yLCBjYWxsYmFjayk7XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgYXN5bmMudGltZXMgPSBfdGltZXMoYXN5bmMubWFwKTtcbiAgICBhc3luYy50aW1lc1NlcmllcyA9IF90aW1lcyhhc3luYy5tYXBTZXJpZXMpO1xuICAgIGFzeW5jLnRpbWVzTGltaXQgPSBmdW5jdGlvbiAoY291bnQsIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spIHtcbiAgICAgICAgcmV0dXJuIGFzeW5jLm1hcExpbWl0KF9yYW5nZShjb3VudCksIGxpbWl0LCBpdGVyYXRvciwgY2FsbGJhY2spO1xuICAgIH07XG5cbiAgICBhc3luYy5zZXEgPSBmdW5jdGlvbiAoLyogZnVuY3Rpb25zLi4uICovKSB7XG4gICAgICAgIHZhciBmbnMgPSBhcmd1bWVudHM7XG4gICAgICAgIHJldHVybiBfcmVzdFBhcmFtKGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG5cbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gbm9vcDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgYXN5bmMucmVkdWNlKGZucywgYXJncywgZnVuY3Rpb24gKG5ld2FyZ3MsIGZuLCBjYikge1xuICAgICAgICAgICAgICAgIGZuLmFwcGx5KHRoYXQsIG5ld2FyZ3MuY29uY2F0KFtfcmVzdFBhcmFtKGZ1bmN0aW9uIChlcnIsIG5leHRhcmdzKSB7XG4gICAgICAgICAgICAgICAgICAgIGNiKGVyciwgbmV4dGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pXSkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlcnIsIHJlc3VsdHMpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseSh0aGF0LCBbZXJyXS5jb25jYXQocmVzdWx0cykpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICBhc3luYy5jb21wb3NlID0gZnVuY3Rpb24gKC8qIGZ1bmN0aW9ucy4uLiAqLykge1xuICAgICAgICByZXR1cm4gYXN5bmMuc2VxLmFwcGx5KG51bGwsIEFycmF5LnByb3RvdHlwZS5yZXZlcnNlLmNhbGwoYXJndW1lbnRzKSk7XG4gICAgfTtcblxuXG4gICAgZnVuY3Rpb24gX2FwcGx5RWFjaChlYWNoZm4pIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24oZm5zLCBhcmdzKSB7XG4gICAgICAgICAgICB2YXIgZ28gPSBfcmVzdFBhcmFtKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGhhdCA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gYXJncy5wb3AoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZWFjaGZuKGZucywgZnVuY3Rpb24gKGZuLCBfLCBjYikge1xuICAgICAgICAgICAgICAgICAgICBmbi5hcHBseSh0aGF0LCBhcmdzLmNvbmNhdChbY2JdKSk7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBjYWxsYmFjayk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBnby5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBnbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuYXBwbHlFYWNoID0gX2FwcGx5RWFjaChhc3luYy5lYWNoT2YpO1xuICAgIGFzeW5jLmFwcGx5RWFjaFNlcmllcyA9IF9hcHBseUVhY2goYXN5bmMuZWFjaE9mU2VyaWVzKTtcblxuXG4gICAgYXN5bmMuZm9yZXZlciA9IGZ1bmN0aW9uIChmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIGRvbmUgPSBvbmx5X29uY2UoY2FsbGJhY2sgfHwgbm9vcCk7XG4gICAgICAgIHZhciB0YXNrID0gZW5zdXJlQXN5bmMoZm4pO1xuICAgICAgICBmdW5jdGlvbiBuZXh0KGVycikge1xuICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkb25lKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0YXNrKG5leHQpO1xuICAgICAgICB9XG4gICAgICAgIG5leHQoKTtcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gZW5zdXJlQXN5bmMoZm4pIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICBhcmdzLnB1c2goZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBpbm5lckFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgaWYgKHN5bmMpIHtcbiAgICAgICAgICAgICAgICAgICAgYXN5bmMuc2V0SW1tZWRpYXRlKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGlubmVyQXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KG51bGwsIGlubmVyQXJncyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB2YXIgc3luYyA9IHRydWU7XG4gICAgICAgICAgICBmbi5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgICAgIHN5bmMgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgYXN5bmMuZW5zdXJlQXN5bmMgPSBlbnN1cmVBc3luYztcblxuICAgIGFzeW5jLmNvbnN0YW50ID0gX3Jlc3RQYXJhbShmdW5jdGlvbih2YWx1ZXMpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbbnVsbF0uY29uY2F0KHZhbHVlcyk7XG4gICAgICAgIHJldHVybiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxsYmFjay5hcHBseSh0aGlzLCBhcmdzKTtcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGFzeW5jLndyYXBTeW5jID1cbiAgICBhc3luYy5hc3luY2lmeSA9IGZ1bmN0aW9uIGFzeW5jaWZ5KGZ1bmMpIHtcbiAgICAgICAgcmV0dXJuIF9yZXN0UGFyYW0oZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICAgICAgICAgIHZhciBjYWxsYmFjayA9IGFyZ3MucG9wKCk7XG4gICAgICAgICAgICB2YXIgcmVzdWx0O1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBjYWxsYmFjayhlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIGlmIHJlc3VsdCBpcyBQcm9taXNlIG9iamVjdFxuICAgICAgICAgICAgaWYgKF9pc09iamVjdChyZXN1bHQpICYmIHR5cGVvZiByZXN1bHQudGhlbiA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0LnRoZW4oZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgdmFsdWUpO1xuICAgICAgICAgICAgICAgIH0pW1wiY2F0Y2hcIl0oZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVyci5tZXNzYWdlID8gZXJyIDogbmV3IEVycm9yKGVycikpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCByZXN1bHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgLy8gTm9kZS5qc1xuICAgIGlmICh0eXBlb2YgbW9kdWxlID09PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgICBtb2R1bGUuZXhwb3J0cyA9IGFzeW5jO1xuICAgIH1cbiAgICAvLyBBTUQgLyBSZXF1aXJlSlNcbiAgICBlbHNlIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICAgICAgZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gYXN5bmM7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBpbmNsdWRlZCBkaXJlY3RseSB2aWEgPHNjcmlwdD4gdGFnXG4gICAgZWxzZSB7XG4gICAgICAgIHJvb3QuYXN5bmMgPSBhc3luYztcbiAgICB9XG5cbn0oKSk7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpLHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWwgOiB0eXBlb2Ygc2VsZiAhPT0gXCJ1bmRlZmluZWRcIiA/IHNlbGYgOiB0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30pXG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247Y2hhcnNldDp1dGYtODtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSnpiM1Z5WTJWeklqcGJJbTV2WkdWZmJXOWtkV3hsY3k5elkyaGxiV0V0YVc1emNHVmpkRzl5TDI1dlpHVmZiVzlrZFd4bGN5OWhjM2x1WXk5c2FXSXZZWE41Ym1NdWFuTWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqdEJRVUZCTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRU0lzSW1acGJHVWlPaUpuWlc1bGNtRjBaV1F1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sYzBOdmJuUmxiblFpT2xzaUx5b2hYRzRnS2lCaGMzbHVZMXh1SUNvZ2FIUjBjSE02THk5bmFYUm9kV0l1WTI5dEwyTmhiMnhoYmk5aGMzbHVZMXh1SUNwY2JpQXFJRU52Y0hseWFXZG9kQ0F5TURFd0xUSXdNVFFnUTJGdmJHRnVJRTFqVFdGb2IyNWNiaUFxSUZKbGJHVmhjMlZrSUhWdVpHVnlJSFJvWlNCTlNWUWdiR2xqWlc1elpWeHVJQ292WEc0b1puVnVZM1JwYjI0Z0tDa2dlMXh1WEc0Z0lDQWdkbUZ5SUdGemVXNWpJRDBnZTMwN1hHNGdJQ0FnWm5WdVkzUnBiMjRnYm05dmNDZ3BJSHQ5WEc0Z0lDQWdablZ1WTNScGIyNGdhV1JsYm5ScGRIa29kaWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnZGp0Y2JpQWdJQ0I5WEc0Z0lDQWdablZ1WTNScGIyNGdkRzlDYjI5c0tIWXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJQ0VoZGp0Y2JpQWdJQ0I5WEc0Z0lDQWdablZ1WTNScGIyNGdibTkwU1dRb2Rpa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdJWFk3WEc0Z0lDQWdmVnh1WEc0Z0lDQWdMeThnWjJ4dlltRnNJRzl1SUhSb1pTQnpaWEoyWlhJc0lIZHBibVJ2ZHlCcGJpQjBhR1VnWW5KdmQzTmxjbHh1SUNBZ0lIWmhjaUJ3Y21WMmFXOTFjMTloYzNsdVl6dGNibHh1SUNBZ0lDOHZJRVZ6ZEdGaWJHbHphQ0IwYUdVZ2NtOXZkQ0J2WW1wbFkzUXNJR0IzYVc1a2IzZGdJQ2hnYzJWc1ptQXBJR2x1SUhSb1pTQmljbTkzYzJWeUxDQmdaMnh2WW1Gc1lGeHVJQ0FnSUM4dklHOXVJSFJvWlNCelpYSjJaWElzSUc5eUlHQjBhR2x6WUNCcGJpQnpiMjFsSUhacGNuUjFZV3dnYldGamFHbHVaWE11SUZkbElIVnpaU0JnYzJWc1ptQmNiaUFnSUNBdkx5QnBibk4wWldGa0lHOW1JR0IzYVc1a2IzZGdJR1p2Y2lCZ1YyVmlWMjl5YTJWeVlDQnpkWEJ3YjNKMExseHVJQ0FnSUhaaGNpQnliMjkwSUQwZ2RIbHdaVzltSUhObGJHWWdQVDA5SUNkdlltcGxZM1FuSUNZbUlITmxiR1l1YzJWc1ppQTlQVDBnYzJWc1ppQW1KaUJ6Wld4bUlIeDhYRzRnSUNBZ0lDQWdJQ0FnSUNCMGVYQmxiMllnWjJ4dlltRnNJRDA5UFNBbmIySnFaV04wSnlBbUppQm5iRzlpWVd3dVoyeHZZbUZzSUQwOVBTQm5iRzlpWVd3Z0ppWWdaMnh2WW1Gc0lIeDhYRzRnSUNBZ0lDQWdJQ0FnSUNCMGFHbHpPMXh1WEc0Z0lDQWdhV1lnS0hKdmIzUWdJVDBnYm5Wc2JDa2dlMXh1SUNBZ0lDQWdJQ0J3Y21WMmFXOTFjMTloYzNsdVl5QTlJSEp2YjNRdVlYTjVibU03WEc0Z0lDQWdmVnh1WEc0Z0lDQWdZWE41Ym1NdWJtOURiMjVtYkdsamRDQTlJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ2NtOXZkQzVoYzNsdVl5QTlJSEJ5WlhacGIzVnpYMkZ6ZVc1ak8xeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1lYTjVibU03WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRzl1YkhsZmIyNWpaU2htYmlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1puVnVZM1JwYjI0b0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9abTRnUFQwOUlHNTFiR3dwSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWhjSWtOaGJHeGlZV05ySUhkaGN5QmhiSEpsWVdSNUlHTmhiR3hsWkM1Y0lpazdYRzRnSUNBZ0lDQWdJQ0FnSUNCbWJpNWhjSEJzZVNoMGFHbHpMQ0JoY21kMWJXVnVkSE1wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdabTRnUFNCdWRXeHNPMXh1SUNBZ0lDQWdJQ0I5TzF4dUlDQWdJSDFjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjl2Ym1ObEtHWnVLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJtZFc1amRHbHZiaWdwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNobWJpQTlQVDBnYm5Wc2JDa2djbVYwZFhKdU8xeHVJQ0FnSUNBZ0lDQWdJQ0FnWm00dVlYQndiSGtvZEdocGN5d2dZWEpuZFcxbGJuUnpLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHWnVJRDBnYm5Wc2JEdGNiaUFnSUNBZ0lDQWdmVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQXZMeTh2SUdOeWIzTnpMV0p5YjNkelpYSWdZMjl0Y0dGMGFXSnNhWFI1SUdaMWJtTjBhVzl1Y3lBdkx5OHZYRzVjYmlBZ0lDQjJZWElnWDNSdlUzUnlhVzVuSUQwZ1QySnFaV04wTG5CeWIzUnZkSGx3WlM1MGIxTjBjbWx1Wnp0Y2JseHVJQ0FnSUhaaGNpQmZhWE5CY25KaGVTQTlJRUZ5Y21GNUxtbHpRWEp5WVhrZ2ZId2dablZ1WTNScGIyNGdLRzlpYWlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1gzUnZVM1J5YVc1bkxtTmhiR3dvYjJKcUtTQTlQVDBnSjF0dlltcGxZM1FnUVhKeVlYbGRKenRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdMeThnVUc5eWRHVmtJR1p5YjIwZ2RXNWtaWEp6WTI5eVpTNXFjeUJwYzA5aWFtVmpkRnh1SUNBZ0lIWmhjaUJmYVhOUFltcGxZM1FnUFNCbWRXNWpkR2x2Ymlodlltb3BJSHRjYmlBZ0lDQWdJQ0FnZG1GeUlIUjVjR1VnUFNCMGVYQmxiMllnYjJKcU8xeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z2RIbHdaU0E5UFQwZ0oyWjFibU4wYVc5dUp5QjhmQ0IwZVhCbElEMDlQU0FuYjJKcVpXTjBKeUFtSmlBaElXOWlhanRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdablZ1WTNScGIyNGdYMmx6UVhKeVlYbE1hV3RsS0dGeWNpa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdYMmx6UVhKeVlYa29ZWEp5S1NCOGZDQW9YRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5Qm9ZWE1nWVNCd2IzTnBkR2wyWlNCcGJuUmxaMlZ5SUd4bGJtZDBhQ0J3Y205d1pYSjBlVnh1SUNBZ0lDQWdJQ0FnSUNBZ2RIbHdaVzltSUdGeWNpNXNaVzVuZEdnZ1BUMDlJRndpYm5WdFltVnlYQ0lnSmlaY2JpQWdJQ0FnSUNBZ0lDQWdJR0Z5Y2k1c1pXNW5kR2dnUGowZ01DQW1KbHh1SUNBZ0lDQWdJQ0FnSUNBZ1lYSnlMbXhsYm1kMGFDQWxJREVnUFQwOUlEQmNiaUFnSUNBZ0lDQWdLVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmZZWEp5WVhsRllXTm9LR0Z5Y2l3Z2FYUmxjbUYwYjNJcElIdGNiaUFnSUNBZ0lDQWdkbUZ5SUdsdVpHVjRJRDBnTFRFc1hHNGdJQ0FnSUNBZ0lDQWdJQ0JzWlc1bmRHZ2dQU0JoY25JdWJHVnVaM1JvTzF4dVhHNGdJQ0FnSUNBZ0lIZG9hV3hsSUNncksybHVaR1Y0SUR3Z2JHVnVaM1JvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwZEdWeVlYUnZjaWhoY25KYmFXNWtaWGhkTENCcGJtUmxlQ3dnWVhKeUtUdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lIMWNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOXRZWEFvWVhKeUxDQnBkR1Z5WVhSdmNpa2dlMXh1SUNBZ0lDQWdJQ0IyWVhJZ2FXNWtaWGdnUFNBdE1TeGNiaUFnSUNBZ0lDQWdJQ0FnSUd4bGJtZDBhQ0E5SUdGeWNpNXNaVzVuZEdnc1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMWJIUWdQU0JCY25KaGVTaHNaVzVuZEdncE8xeHVYRzRnSUNBZ0lDQWdJSGRvYVd4bElDZ3JLMmx1WkdWNElEd2diR1Z1WjNSb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYTjFiSFJiYVc1a1pYaGRJRDBnYVhSbGNtRjBiM0lvWVhKeVcybHVaR1Y0WFN3Z2FXNWtaWGdzSUdGeWNpazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJSEpsYzNWc2REdGNiaUFnSUNCOVhHNWNiaUFnSUNCbWRXNWpkR2x2YmlCZmNtRnVaMlVvWTI5MWJuUXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJRjl0WVhBb1FYSnlZWGtvWTI5MWJuUXBMQ0JtZFc1amRHbHZiaUFvZGl3Z2FTa2dleUJ5WlhSMWNtNGdhVHNnZlNrN1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnWDNKbFpIVmpaU2hoY25Jc0lHbDBaWEpoZEc5eUxDQnRaVzF2S1NCN1hHNGdJQ0FnSUNBZ0lGOWhjbkpoZVVWaFkyZ29ZWEp5TENCbWRXNWpkR2x2YmlBb2VDd2dhU3dnWVNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYldWdGJ5QTlJR2wwWlhKaGRHOXlLRzFsYlc4c0lIZ3NJR2tzSUdFcE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJRzFsYlc4N1hHNGdJQ0FnZlZ4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnWDJadmNrVmhZMmhQWmlodlltcGxZM1FzSUdsMFpYSmhkRzl5S1NCN1hHNGdJQ0FnSUNBZ0lGOWhjbkpoZVVWaFkyZ29YMnRsZVhNb2IySnFaV04wS1N3Z1puVnVZM1JwYjI0Z0tHdGxlU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhWFJsY21GMGIzSW9iMkpxWldOMFcydGxlVjBzSUd0bGVTazdYRzRnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJSDFjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjlwYm1SbGVFOW1LR0Z5Y2l3Z2FYUmxiU2tnZTF4dUlDQWdJQ0FnSUNCbWIzSWdLSFpoY2lCcElEMGdNRHNnYVNBOElHRnljaTVzWlc1bmRHZzdJR2tyS3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHRnljbHRwWFNBOVBUMGdhWFJsYlNrZ2NtVjBkWEp1SUdrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlDMHhPMXh1SUNBZ0lIMWNibHh1SUNBZ0lIWmhjaUJmYTJWNWN5QTlJRTlpYW1WamRDNXJaWGx6SUh4OElHWjFibU4wYVc5dUlDaHZZbW9wSUh0Y2JpQWdJQ0FnSUNBZ2RtRnlJR3RsZVhNZ1BTQmJYVHRjYmlBZ0lDQWdJQ0FnWm05eUlDaDJZWElnYXlCcGJpQnZZbW9wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNodlltb3VhR0Z6VDNkdVVISnZjR1Z5ZEhrb2F5a3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JyWlhsekxuQjFjMmdvYXlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUd0bGVYTTdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOXJaWGxKZEdWeVlYUnZjaWhqYjJ4c0tTQjdYRzRnSUNBZ0lDQWdJSFpoY2lCcElEMGdMVEU3WEc0Z0lDQWdJQ0FnSUhaaGNpQnNaVzQ3WEc0Z0lDQWdJQ0FnSUhaaGNpQnJaWGx6TzF4dUlDQWdJQ0FnSUNCcFppQW9YMmx6UVhKeVlYbE1hV3RsS0dOdmJHd3BLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnNaVzRnUFNCamIyeHNMbXhsYm1kMGFEdGNiaUFnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJtZFc1amRHbHZiaUJ1WlhoMEtDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2tyS3p0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnYVNBOElHeGxiaUEvSUdrZ09pQnVkV3hzTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVHRjYmlBZ0lDQWdJQ0FnZlNCbGJITmxJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHdGxlWE1nUFNCZmEyVjVjeWhqYjJ4c0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUd4bGJpQTlJR3RsZVhNdWJHVnVaM1JvTzF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHWjFibU4wYVc5dUlHNWxlSFFvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FTc3JPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQnBJRHdnYkdWdUlEOGdhMlY1YzF0cFhTQTZJRzUxYkd3N1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5TzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnZlZ4dVhHNGdJQ0FnTHk4Z1UybHRhV3hoY2lCMGJ5QkZVelluY3lCeVpYTjBJSEJoY21GdElDaG9kSFJ3T2k4dllYSnBlV0V1YjJacGJHRmljeTVqYjIwdk1qQXhNeTh3TXk5bGN6WXRZVzVrTFhKbGMzUXRjR0Z5WVcxbGRHVnlMbWgwYld3cFhHNGdJQ0FnTHk4Z1ZHaHBjeUJoWTJOMWJYVnNZWFJsY3lCMGFHVWdZWEpuZFcxbGJuUnpJSEJoYzNObFpDQnBiblJ2SUdGdUlHRnljbUY1TENCaFpuUmxjaUJoSUdkcGRtVnVJR2x1WkdWNExseHVJQ0FnSUM4dklFWnliMjBnZFc1a1pYSnpZMjl5WlM1cWN5QW9hSFIwY0hNNkx5OW5hWFJvZFdJdVkyOXRMMnBoYzJoclpXNWhjeTkxYm1SbGNuTmpiM0psTDNCMWJHd3ZNakUwTUNrdVhHNGdJQ0FnWm5WdVkzUnBiMjRnWDNKbGMzUlFZWEpoYlNobWRXNWpMQ0J6ZEdGeWRFbHVaR1Y0S1NCN1hHNGdJQ0FnSUNBZ0lITjBZWEowU1c1a1pYZ2dQU0J6ZEdGeWRFbHVaR1Y0SUQwOUlHNTFiR3dnUHlCbWRXNWpMbXhsYm1kMGFDQXRJREVnT2lBcmMzUmhjblJKYm1SbGVEdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWjFibU4wYVc5dUtDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR3hsYm1kMGFDQTlJRTFoZEdndWJXRjRLR0Z5WjNWdFpXNTBjeTVzWlc1bmRHZ2dMU0J6ZEdGeWRFbHVaR1Y0TENBd0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQnlaWE4wSUQwZ1FYSnlZWGtvYkdWdVozUm9LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHWnZjaUFvZG1GeUlHbHVaR1Y0SUQwZ01Ec2dhVzVrWlhnZ1BDQnNaVzVuZEdnN0lHbHVaR1Y0S3lzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWE4wVzJsdVpHVjRYU0E5SUdGeVozVnRaVzUwYzF0cGJtUmxlQ0FySUhOMFlYSjBTVzVrWlhoZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdjM2RwZEdOb0lDaHpkR0Z5ZEVsdVpHVjRLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGelpTQXdPaUJ5WlhSMWNtNGdablZ1WXk1allXeHNLSFJvYVhNc0lISmxjM1FwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGMyVWdNVG9nY21WMGRYSnVJR1oxYm1NdVkyRnNiQ2gwYUdsekxDQmhjbWQxYldWdWRITmJNRjBzSUhKbGMzUXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z1EzVnljbVZ1ZEd4NUlIVnVkWE5sWkNCaWRYUWdhR0Z1Wkd4bElHTmhjMlZ6SUc5MWRITnBaR1VnYjJZZ2RHaGxJSE4zYVhSamFDQnpkR0YwWlcxbGJuUTZYRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5QjJZWElnWVhKbmN5QTlJRUZ5Y21GNUtITjBZWEowU1c1a1pYZ2dLeUF4S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQzh2SUdadmNpQW9hVzVrWlhnZ1BTQXdPeUJwYm1SbGVDQThJSE4wWVhKMFNXNWtaWGc3SUdsdVpHVjRLeXNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQzh2SUNBZ0lDQmhjbWR6VzJsdVpHVjRYU0E5SUdGeVozVnRaVzUwYzF0cGJtUmxlRjA3WEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMeUI5WEc0Z0lDQWdJQ0FnSUNBZ0lDQXZMeUJoY21kelczTjBZWEowU1c1a1pYaGRJRDBnY21WemREdGNiaUFnSUNBZ0lDQWdJQ0FnSUM4dklISmxkSFZ5YmlCbWRXNWpMbUZ3Y0d4NUtIUm9hWE1zSUdGeVozTXBPMXh1SUNBZ0lDQWdJQ0I5TzF4dUlDQWdJSDFjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjkzYVhSb2IzVjBTVzVrWlhnb2FYUmxjbUYwYjNJcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlHWjFibU4wYVc5dUlDaDJZV3gxWlN3Z2FXNWtaWGdzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdhWFJsY21GMGIzSW9kbUZzZFdVc0lHTmhiR3hpWVdOcktUdGNiaUFnSUNBZ0lDQWdmVHRjYmlBZ0lDQjlYRzVjYmlBZ0lDQXZMeTh2SUdWNGNHOXlkR1ZrSUdGemVXNWpJRzF2WkhWc1pTQm1kVzVqZEdsdmJuTWdMeTh2TDF4dVhHNGdJQ0FnTHk4dkx5QnVaWGgwVkdsamF5QnBiWEJzWlcxbGJuUmhkR2x2YmlCM2FYUm9JR0p5YjNkelpYSXRZMjl0Y0dGMGFXSnNaU0JtWVd4c1ltRmpheUF2THk4dlhHNWNiaUFnSUNBdkx5QmpZWEIwZFhKbElIUm9aU0JuYkc5aVlXd2djbVZtWlhKbGJtTmxJSFJ2SUdkMVlYSmtJR0ZuWVdsdWMzUWdabUZyWlZScGJXVnlJRzF2WTJ0elhHNGdJQ0FnZG1GeUlGOXpaWFJKYlcxbFpHbGhkR1VnUFNCMGVYQmxiMllnYzJWMFNXMXRaV1JwWVhSbElEMDlQU0FuWm5WdVkzUnBiMjRuSUNZbUlITmxkRWx0YldWa2FXRjBaVHRjYmx4dUlDQWdJSFpoY2lCZlpHVnNZWGtnUFNCZmMyVjBTVzF0WldScFlYUmxJRDhnWm5WdVkzUnBiMjRvWm00cElIdGNiaUFnSUNBZ0lDQWdMeThnYm05MElHRWdaR2x5WldOMElHRnNhV0Z6SUdadmNpQkpSVEV3SUdOdmJYQmhkR2xpYVd4cGRIbGNiaUFnSUNBZ0lDQWdYM05sZEVsdGJXVmthV0YwWlNobWJpazdYRzRnSUNBZ2ZTQTZJR1oxYm1OMGFXOXVLR1p1S1NCN1hHNGdJQ0FnSUNBZ0lITmxkRlJwYldWdmRYUW9abTRzSURBcE8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNCcFppQW9kSGx3Wlc5bUlIQnliMk5sYzNNZ1BUMDlJQ2R2WW1wbFkzUW5JQ1ltSUhSNWNHVnZaaUJ3Y205alpYTnpMbTVsZUhSVWFXTnJJRDA5UFNBblpuVnVZM1JwYjI0bktTQjdYRzRnSUNBZ0lDQWdJR0Z6ZVc1akxtNWxlSFJVYVdOcklEMGdjSEp2WTJWemN5NXVaWGgwVkdsamF6dGNiaUFnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNCaGMzbHVZeTV1WlhoMFZHbGpheUE5SUY5a1pXeGhlVHRjYmlBZ0lDQjlYRzRnSUNBZ1lYTjVibU11YzJWMFNXMXRaV1JwWVhSbElEMGdYM05sZEVsdGJXVmthV0YwWlNBL0lGOWtaV3hoZVNBNklHRnplVzVqTG01bGVIUlVhV05yTzF4dVhHNWNiaUFnSUNCaGMzbHVZeTVtYjNKRllXTm9JRDFjYmlBZ0lDQmhjM2x1WXk1bFlXTm9JRDBnWm5WdVkzUnBiMjRnS0dGeWNpd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJoYzNsdVl5NWxZV05vVDJZb1lYSnlMQ0JmZDJsMGFHOTFkRWx1WkdWNEtHbDBaWEpoZEc5eUtTd2dZMkZzYkdKaFkyc3BPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQmhjM2x1WXk1bWIzSkZZV05vVTJWeWFXVnpJRDFjYmlBZ0lDQmhjM2x1WXk1bFlXTm9VMlZ5YVdWeklEMGdablZ1WTNScGIyNGdLR0Z5Y2l3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQmhjM2x1WXk1bFlXTm9UMlpUWlhKcFpYTW9ZWEp5TENCZmQybDBhRzkxZEVsdVpHVjRLR2wwWlhKaGRHOXlLU3dnWTJGc2JHSmhZMnNwTzF4dUlDQWdJSDA3WEc1Y2JseHVJQ0FnSUdGemVXNWpMbVp2Y2tWaFkyaE1hVzFwZENBOVhHNGdJQ0FnWVhONWJtTXVaV0ZqYUV4cGJXbDBJRDBnWm5WdVkzUnBiMjRnS0dGeWNpd2diR2x0YVhRc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdYMlZoWTJoUFpreHBiV2wwS0d4cGJXbDBLU2hoY25Jc0lGOTNhWFJvYjNWMFNXNWtaWGdvYVhSbGNtRjBiM0lwTENCallXeHNZbUZqYXlrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbVp2Y2tWaFkyaFBaaUE5WEc0Z0lDQWdZWE41Ym1NdVpXRmphRTltSUQwZ1puVnVZM1JwYjI0Z0tHOWlhbVZqZEN3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJR05oYkd4aVlXTnJJRDBnWDI5dVkyVW9ZMkZzYkdKaFkyc2dmSHdnYm05dmNDazdYRzRnSUNBZ0lDQWdJRzlpYW1WamRDQTlJRzlpYW1WamRDQjhmQ0JiWFR0Y2JseHVJQ0FnSUNBZ0lDQjJZWElnYVhSbGNpQTlJRjlyWlhsSmRHVnlZWFJ2Y2lodlltcGxZM1FwTzF4dUlDQWdJQ0FnSUNCMllYSWdhMlY1TENCamIyMXdiR1YwWldRZ1BTQXdPMXh1WEc0Z0lDQWdJQ0FnSUhkb2FXeGxJQ2dvYTJWNUlEMGdhWFJsY2lncEtTQWhQU0J1ZFd4c0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCamIyMXdiR1YwWldRZ0t6MGdNVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbDBaWEpoZEc5eUtHOWlhbVZqZEZ0clpYbGRMQ0JyWlhrc0lHOXViSGxmYjI1alpTaGtiMjVsS1NrN1hHNGdJQ0FnSUNBZ0lIMWNibHh1SUNBZ0lDQWdJQ0JwWmlBb1kyOXRjR3hsZEdWa0lEMDlQU0F3S1NCallXeHNZbUZqYXlodWRXeHNLVHRjYmx4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCa2IyNWxLR1Z5Y2lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTI5dGNHeGxkR1ZrTFMwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1pYSnlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvWlhKeUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQzh2SUVOb1pXTnJJR3RsZVNCcGN5QnVkV3hzSUdsdUlHTmhjMlVnYVhSbGNtRjBiM0lnYVhOdUozUWdaWGhvWVhWemRHVmtYRzRnSUNBZ0lDQWdJQ0FnSUNBdkx5QmhibVFnWkc5dVpTQnlaWE52YkhabFpDQnplVzVqYUhKdmJtOTFjMng1TGx4dUlDQWdJQ0FnSUNBZ0lDQWdaV3h6WlNCcFppQW9hMlY1SUQwOVBTQnVkV3hzSUNZbUlHTnZiWEJzWlhSbFpDQThQU0F3S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzb2JuVnNiQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdZWE41Ym1NdVptOXlSV0ZqYUU5bVUyVnlhV1Z6SUQxY2JpQWdJQ0JoYzNsdVl5NWxZV05vVDJaVFpYSnBaWE1nUFNCbWRXNWpkR2x2YmlBb2IySnFMQ0JwZEdWeVlYUnZjaXdnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ1kyRnNiR0poWTJzZ1BTQmZiMjVqWlNoallXeHNZbUZqYXlCOGZDQnViMjl3S1R0Y2JpQWdJQ0FnSUNBZ2IySnFJRDBnYjJKcUlIeDhJRnRkTzF4dUlDQWdJQ0FnSUNCMllYSWdibVY0ZEV0bGVTQTlJRjlyWlhsSmRHVnlZWFJ2Y2lodlltb3BPMXh1SUNBZ0lDQWdJQ0IyWVhJZ2EyVjVJRDBnYm1WNGRFdGxlU2dwTzF4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCcGRHVnlZWFJsS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlITjVibU1nUFNCMGNuVmxPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWWdLR3RsZVNBOVBUMGdiblZzYkNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCallXeHNZbUZqYXlodWRXeHNLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUdsMFpYSmhkRzl5S0c5aWFsdHJaWGxkTENCclpYa3NJRzl1YkhsZmIyNWpaU2htZFc1amRHbHZiaUFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dWeWNpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlobGNuSXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYTJWNUlEMGdibVY0ZEV0bGVTZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9hMlY1SUQwOVBTQnVkV3hzS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWTJGc2JHSmhZMnNvYm5Wc2JDazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2MzbHVZeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRnplVzVqTG5ObGRFbHRiV1ZrYVdGMFpTaHBkR1Z5WVhSbEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMGdaV3h6WlNCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhWFJsY21GMFpTZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYzNsdVl5QTlJR1poYkhObE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJR2wwWlhKaGRHVW9LVHRjYmlBZ0lDQjlPMXh1WEc1Y2JseHVJQ0FnSUdGemVXNWpMbVp2Y2tWaFkyaFBaa3hwYldsMElEMWNiaUFnSUNCaGMzbHVZeTVsWVdOb1QyWk1hVzFwZENBOUlHWjFibU4wYVc5dUlDaHZZbW9zSUd4cGJXbDBMQ0JwZEdWeVlYUnZjaXdnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ1gyVmhZMmhQWmt4cGJXbDBLR3hwYldsMEtTaHZZbW9zSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdaMWJtTjBhVzl1SUY5bFlXTm9UMlpNYVcxcGRDaHNhVzFwZENrZ2UxeHVYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQm1kVzVqZEdsdmJpQW9iMkpxTENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05ySUQwZ1gyOXVZMlVvWTJGc2JHSmhZMnNnZkh3Z2JtOXZjQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnZZbW9nUFNCdlltb2dmSHdnVzEwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2JtVjRkRXRsZVNBOUlGOXJaWGxKZEdWeVlYUnZjaWh2WW1vcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHeHBiV2wwSUR3OUlEQXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdZMkZzYkdKaFkyc29iblZzYkNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQjJZWElnWkc5dVpTQTlJR1poYkhObE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlISjFibTVwYm1jZ1BTQXdPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR1Z5Y205eVpXUWdQU0JtWVd4elpUdGNibHh1SUNBZ0lDQWdJQ0FnSUNBZ0tHWjFibU4wYVc5dUlISmxjR3hsYm1semFDQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHUnZibVVnSmlZZ2NuVnVibWx1WnlBOFBTQXdLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCallXeHNZbUZqYXlodWRXeHNLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCM2FHbHNaU0FvY25WdWJtbHVaeUE4SUd4cGJXbDBJQ1ltSUNGbGNuSnZjbVZrS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCclpYa2dQU0J1WlhoMFMyVjVLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hyWlhrZ1BUMDlJRzUxYkd3cElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHUnZibVVnUFNCMGNuVmxPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hKMWJtNXBibWNnUEQwZ01Da2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05yS0c1MWJHd3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdU8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISjFibTVwYm1jZ0t6MGdNVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2FYUmxjbUYwYjNJb2IySnFXMnRsZVYwc0lHdGxlU3dnYjI1c2VWOXZibU5sS0daMWJtTjBhVzl1SUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEoxYm01cGJtY2dMVDBnTVR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aGxjbklwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHVnljbTl5WldRZ1BTQjBjblZsTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21Wd2JHVnVhWE5vS0NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1NncE8xeHVJQ0FnSUNBZ0lDQjlPMXh1SUNBZ0lIMWNibHh1WEc0Z0lDQWdablZ1WTNScGIyNGdaRzlRWVhKaGJHeGxiQ2htYmlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1puVnVZM1JwYjI0Z0tHOWlhaXdnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhSMWNtNGdabTRvWVhONWJtTXVaV0ZqYUU5bUxDQnZZbW9zSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrN1hHNGdJQ0FnSUNBZ0lIMDdYRzRnSUNBZ2ZWeHVJQ0FnSUdaMWJtTjBhVzl1SUdSdlVHRnlZV3hzWld4TWFXMXBkQ2htYmlrZ2UxeHVJQ0FnSUNBZ0lDQnlaWFIxY200Z1puVnVZM1JwYjI0Z0tHOWlhaXdnYkdsdGFYUXNJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHWnVLRjlsWVdOb1QyWk1hVzFwZENoc2FXMXBkQ2tzSUc5aWFpd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0I5WEc0Z0lDQWdablZ1WTNScGIyNGdaRzlUWlhKcFpYTW9abTRwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1SUNodlltb3NJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHWnVLR0Z6ZVc1akxtVmhZMmhQWmxObGNtbGxjeXdnYjJKcUxDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BPMXh1SUNBZ0lDQWdJQ0I5TzF4dUlDQWdJSDFjYmx4dUlDQWdJR1oxYm1OMGFXOXVJRjloYzNsdVkwMWhjQ2hsWVdOb1ptNHNJR0Z5Y2l3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJR05oYkd4aVlXTnJJRDBnWDI5dVkyVW9ZMkZzYkdKaFkyc2dmSHdnYm05dmNDazdYRzRnSUNBZ0lDQWdJR0Z5Y2lBOUlHRnljaUI4ZkNCYlhUdGNiaUFnSUNBZ0lDQWdkbUZ5SUhKbGMzVnNkSE1nUFNCZmFYTkJjbkpoZVV4cGEyVW9ZWEp5S1NBL0lGdGRJRG9nZTMwN1hHNGdJQ0FnSUNBZ0lHVmhZMmhtYmloaGNuSXNJR1oxYm1OMGFXOXVJQ2gyWVd4MVpTd2dhVzVrWlhnc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCcGRHVnlZWFJ2Y2loMllXeDFaU3dnWm5WdVkzUnBiMjRnS0dWeWNpd2dkaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGMzVnNkSE5iYVc1a1pYaGRJRDBnZGp0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlobGNuSXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJSDBzSUdaMWJtTjBhVzl1SUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHVnljaXdnY21WemRXeDBjeWs3WEc0Z0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdGemVXNWpMbTFoY0NBOUlHUnZVR0Z5WVd4c1pXd29YMkZ6ZVc1alRXRndLVHRjYmlBZ0lDQmhjM2x1WXk1dFlYQlRaWEpwWlhNZ1BTQmtiMU5sY21sbGN5aGZZWE41Ym1OTllYQXBPMXh1SUNBZ0lHRnplVzVqTG0xaGNFeHBiV2wwSUQwZ1pHOVFZWEpoYkd4bGJFeHBiV2wwS0Y5aGMzbHVZMDFoY0NrN1hHNWNiaUFnSUNBdkx5QnlaV1IxWTJVZ2IyNXNlU0JvWVhNZ1lTQnpaWEpwWlhNZ2RtVnljMmx2Yml3Z1lYTWdaRzlwYm1jZ2NtVmtkV05sSUdsdUlIQmhjbUZzYkdWc0lIZHZiaWQwWEc0Z0lDQWdMeThnZDI5eWF5QnBiaUJ0WVc1NUlITnBkSFZoZEdsdmJuTXVYRzRnSUNBZ1lYTjVibU11YVc1cVpXTjBJRDFjYmlBZ0lDQmhjM2x1WXk1bWIyeGtiQ0E5WEc0Z0lDQWdZWE41Ym1NdWNtVmtkV05sSUQwZ1puVnVZM1JwYjI0Z0tHRnljaXdnYldWdGJ5d2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUdGemVXNWpMbVZoWTJoUFpsTmxjbWxsY3loaGNuSXNJR1oxYm1OMGFXOXVJQ2g0TENCcExDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2FYUmxjbUYwYjNJb2JXVnRieXdnZUN3Z1puVnVZM1JwYjI0Z0tHVnljaXdnZGlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHMWxiVzhnUFNCMk8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHVnljaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnZlN3Z1puVnVZM1JwYjI0Z0tHVnljaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc29aWEp5TENCdFpXMXZLVHRjYmlBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbVp2YkdSeUlEMWNiaUFnSUNCaGMzbHVZeTV5WldSMVkyVlNhV2RvZENBOUlHWjFibU4wYVc5dUlDaGhjbklzSUcxbGJXOHNJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCMllYSWdjbVYyWlhKelpXUWdQU0JmYldGd0tHRnljaXdnYVdSbGJuUnBkSGtwTG5KbGRtVnljMlVvS1R0Y2JpQWdJQ0FnSUNBZ1lYTjVibU11Y21Wa2RXTmxLSEpsZG1WeWMyVmtMQ0J0WlcxdkxDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQmhjM2x1WXk1MGNtRnVjMlp2Y20wZ1BTQm1kVzVqZEdsdmJpQW9ZWEp5TENCdFpXMXZMQ0JwZEdWeVlYUnZjaXdnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ2FXWWdLR0Z5WjNWdFpXNTBjeTVzWlc1bmRHZ2dQVDA5SURNcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdOaGJHeGlZV05ySUQwZ2FYUmxjbUYwYjNJN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwZEdWeVlYUnZjaUE5SUcxbGJXODdYRzRnSUNBZ0lDQWdJQ0FnSUNCdFpXMXZJRDBnWDJselFYSnlZWGtvWVhKeUtTQS9JRnRkSURvZ2UzMDdYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNCaGMzbHVZeTVsWVdOb1QyWW9ZWEp5TENCbWRXNWpkR2x2YmloMkxDQnJMQ0JqWWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVhSbGNtRjBiM0lvYldWdGJ5d2dkaXdnYXl3Z1kySXBPMXh1SUNBZ0lDQWdJQ0I5TENCbWRXNWpkR2x2YmlobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHVnljaXdnYldWdGJ5azdYRzRnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JtZFc1amRHbHZiaUJmWm1sc2RHVnlLR1ZoWTJobWJpd2dZWEp5TENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdkbUZ5SUhKbGMzVnNkSE1nUFNCYlhUdGNiaUFnSUNBZ0lDQWdaV0ZqYUdadUtHRnljaXdnWm5WdVkzUnBiMjRnS0hnc0lHbHVaR1Y0TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVhSbGNtRjBiM0lvZUN3Z1puVnVZM1JwYjI0Z0tIWXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb2Rpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYTjFiSFJ6TG5CMWMyZ29lMmx1WkdWNE9pQnBibVJsZUN3Z2RtRnNkV1U2SUhoOUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc29LVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0I5TENCbWRXNWpkR2x2YmlBb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXloZmJXRndLSEpsYzNWc2RITXVjMjl5ZENobWRXNWpkR2x2YmlBb1lTd2dZaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKbGRIVnliaUJoTG1sdVpHVjRJQzBnWWk1cGJtUmxlRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBMQ0JtZFc1amRHbHZiaUFvZUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCNExuWmhiSFZsTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU2twTzF4dUlDQWdJQ0FnSUNCOUtUdGNiaUFnSUNCOVhHNWNiaUFnSUNCaGMzbHVZeTV6Wld4bFkzUWdQVnh1SUNBZ0lHRnplVzVqTG1acGJIUmxjaUE5SUdSdlVHRnlZV3hzWld3b1gyWnBiSFJsY2lrN1hHNWNiaUFnSUNCaGMzbHVZeTV6Wld4bFkzUk1hVzFwZENBOVhHNGdJQ0FnWVhONWJtTXVabWxzZEdWeVRHbHRhWFFnUFNCa2IxQmhjbUZzYkdWc1RHbHRhWFFvWDJacGJIUmxjaWs3WEc1Y2JpQWdJQ0JoYzNsdVl5NXpaV3hsWTNSVFpYSnBaWE1nUFZ4dUlDQWdJR0Z6ZVc1akxtWnBiSFJsY2xObGNtbGxjeUE5SUdSdlUyVnlhV1Z6S0Y5bWFXeDBaWElwTzF4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnWDNKbGFtVmpkQ2hsWVdOb1ptNHNJR0Z5Y2l3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJRjltYVd4MFpYSW9aV0ZqYUdadUxDQmhjbklzSUdaMWJtTjBhVzl1S0haaGJIVmxMQ0JqWWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVhSbGNtRjBiM0lvZG1Gc2RXVXNJR1oxYm1OMGFXOXVLSFlwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallpZ2hkaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQWdJQ0FnZlN3Z1kyRnNiR0poWTJzcE8xeHVJQ0FnSUgxY2JpQWdJQ0JoYzNsdVl5NXlaV3BsWTNRZ1BTQmtiMUJoY21Gc2JHVnNLRjl5WldwbFkzUXBPMXh1SUNBZ0lHRnplVzVqTG5KbGFtVmpkRXhwYldsMElEMGdaRzlRWVhKaGJHeGxiRXhwYldsMEtGOXlaV3BsWTNRcE8xeHVJQ0FnSUdGemVXNWpMbkpsYW1WamRGTmxjbWxsY3lBOUlHUnZVMlZ5YVdWektGOXlaV3BsWTNRcE8xeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gyTnlaV0YwWlZSbGMzUmxjaWhsWVdOb1ptNHNJR05vWldOckxDQm5aWFJTWlhOMWJIUXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVLR0Z5Y2l3Z2JHbHRhWFFzSUdsMFpYSmhkRzl5TENCallpa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1puVnVZM1JwYjI0Z1pHOXVaU2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9ZMklwSUdOaUtHZGxkRkpsYzNWc2RDaG1ZV3h6WlN3Z2RtOXBaQ0F3S1NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQnBkR1Z5WVhSbFpTaDRMQ0JmTENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2doWTJJcElISmxkSFZ5YmlCallXeHNZbUZqYXlncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbDBaWEpoZEc5eUtIZ3NJR1oxYm1OMGFXOXVJQ2gyS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoallpQW1KaUJqYUdWamF5aDJLU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJJb1oyVjBVbVZ6ZFd4MEtIUnlkV1VzSUhncEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmlJRDBnYVhSbGNtRjBiM0lnUFNCbVlXeHpaVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWdwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dGeVozVnRaVzUwY3k1c1pXNW5kR2dnUGlBektTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaV0ZqYUdadUtHRnljaXdnYkdsdGFYUXNJR2wwWlhKaGRHVmxMQ0JrYjI1bEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJJZ1BTQnBkR1Z5WVhSdmNqdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBkR1Z5WVhSdmNpQTlJR3hwYldsME8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHVmhZMmhtYmloaGNuSXNJR2wwWlhKaGRHVmxMQ0JrYjI1bEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZUdGNiaUFnSUNCOVhHNWNiaUFnSUNCaGMzbHVZeTVoYm5rZ1BWeHVJQ0FnSUdGemVXNWpMbk52YldVZ1BTQmZZM0psWVhSbFZHVnpkR1Z5S0dGemVXNWpMbVZoWTJoUFppd2dkRzlDYjI5c0xDQnBaR1Z1ZEdsMGVTazdYRzVjYmlBZ0lDQmhjM2x1WXk1emIyMWxUR2x0YVhRZ1BTQmZZM0psWVhSbFZHVnpkR1Z5S0dGemVXNWpMbVZoWTJoUFpreHBiV2wwTENCMGIwSnZiMndzSUdsa1pXNTBhWFI1S1R0Y2JseHVJQ0FnSUdGemVXNWpMbUZzYkNBOVhHNGdJQ0FnWVhONWJtTXVaWFpsY25rZ1BTQmZZM0psWVhSbFZHVnpkR1Z5S0dGemVXNWpMbVZoWTJoUFppd2dibTkwU1dRc0lHNXZkRWxrS1R0Y2JseHVJQ0FnSUdGemVXNWpMbVYyWlhKNVRHbHRhWFFnUFNCZlkzSmxZWFJsVkdWemRHVnlLR0Z6ZVc1akxtVmhZMmhQWmt4cGJXbDBMQ0J1YjNSSlpDd2dibTkwU1dRcE8xeHVYRzRnSUNBZ1puVnVZM1JwYjI0Z1gyWnBibVJIWlhSU1pYTjFiSFFvZGl3Z2VDa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdlRHRjYmlBZ0lDQjlYRzRnSUNBZ1lYTjVibU11WkdWMFpXTjBJRDBnWDJOeVpXRjBaVlJsYzNSbGNpaGhjM2x1WXk1bFlXTm9UMllzSUdsa1pXNTBhWFI1TENCZlptbHVaRWRsZEZKbGMzVnNkQ2s3WEc0Z0lDQWdZWE41Ym1NdVpHVjBaV04wVTJWeWFXVnpJRDBnWDJOeVpXRjBaVlJsYzNSbGNpaGhjM2x1WXk1bFlXTm9UMlpUWlhKcFpYTXNJR2xrWlc1MGFYUjVMQ0JmWm1sdVpFZGxkRkpsYzNWc2RDazdYRzRnSUNBZ1lYTjVibU11WkdWMFpXTjBUR2x0YVhRZ1BTQmZZM0psWVhSbFZHVnpkR1Z5S0dGemVXNWpMbVZoWTJoUFpreHBiV2wwTENCcFpHVnVkR2wwZVN3Z1gyWnBibVJIWlhSU1pYTjFiSFFwTzF4dVhHNGdJQ0FnWVhONWJtTXVjMjl5ZEVKNUlEMGdablZ1WTNScGIyNGdLR0Z5Y2l3Z2FYUmxjbUYwYjNJc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJR0Z6ZVc1akxtMWhjQ2hoY25Jc0lHWjFibU4wYVc5dUlDaDRMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdhWFJsY21GMGIzSW9lQ3dnWm5WdVkzUnBiMjRnS0dWeWNpd2dZM0pwZEdWeWFXRXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1pYSnlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHVnljaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlodWRXeHNMQ0I3ZG1Gc2RXVTZJSGdzSUdOeWFYUmxjbWxoT2lCamNtbDBaWEpwWVgwcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUNBZ0lDQjlMQ0JtZFc1amRHbHZiaUFvWlhKeUxDQnlaWE4xYkhSektTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9aWEp5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdOaGJHeGlZV05yS0dWeWNpazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aHVkV3hzTENCZmJXRndLSEpsYzNWc2RITXVjMjl5ZENoamIyMXdZWEpoZEc5eUtTd2dablZ1WTNScGIyNGdLSGdwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlIZ3VkbUZzZFdVN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTa3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJSDBwTzF4dVhHNGdJQ0FnSUNBZ0lHWjFibU4wYVc5dUlHTnZiWEJoY21GMGIzSW9iR1ZtZEN3Z2NtbG5hSFFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCaElEMGdiR1ZtZEM1amNtbDBaWEpwWVN3Z1lpQTlJSEpwWjJoMExtTnlhWFJsY21saE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR0VnUENCaUlEOGdMVEVnT2lCaElENGdZaUEvSURFZ09pQXdPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR0Z6ZVc1akxtRjFkRzhnUFNCbWRXNWpkR2x2YmlBb2RHRnphM01zSUdOdmJtTjFjbkpsYm1ONUxDQmpZV3hzWW1GamF5a2dlMXh1SUNBZ0lDQWdJQ0JwWmlBb2RIbHdaVzltSUdGeVozVnRaVzUwYzFzeFhTQTlQVDBnSjJaMWJtTjBhVzl1SnlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z1kyOXVZM1Z5Y21WdVkza2dhWE1nYjNCMGFXOXVZV3dzSUhOb2FXWjBJSFJvWlNCaGNtZHpMbHh1SUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzZ1BTQmpiMjVqZFhKeVpXNWplVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHTnZibU4xY25KbGJtTjVJRDBnYm5Wc2JEdGNiaUFnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0JqWVd4c1ltRmpheUE5SUY5dmJtTmxLR05oYkd4aVlXTnJJSHg4SUc1dmIzQXBPMXh1SUNBZ0lDQWdJQ0IyWVhJZ2EyVjVjeUE5SUY5clpYbHpLSFJoYzJ0ektUdGNiaUFnSUNBZ0lDQWdkbUZ5SUhKbGJXRnBibWx1WjFSaGMydHpJRDBnYTJWNWN5NXNaVzVuZEdnN1hHNGdJQ0FnSUNBZ0lHbG1JQ2doY21WdFlXbHVhVzVuVkdGemEzTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCallXeHNZbUZqYXlodWRXeHNLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCcFppQW9JV052Ym1OMWNuSmxibU41S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqYjI1amRYSnlaVzVqZVNBOUlISmxiV0ZwYm1sdVoxUmhjMnR6TzF4dUlDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdkbUZ5SUhKbGMzVnNkSE1nUFNCN2ZUdGNiaUFnSUNBZ0lDQWdkbUZ5SUhKMWJtNXBibWRVWVhOcmN5QTlJREE3WEc1Y2JpQWdJQ0FnSUNBZ2RtRnlJR2hoYzBWeWNtOXlJRDBnWm1Gc2MyVTdYRzVjYmlBZ0lDQWdJQ0FnZG1GeUlHeHBjM1JsYm1WeWN5QTlJRnRkTzF4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCaFpHUk1hWE4wWlc1bGNpaG1iaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdiR2x6ZEdWdVpYSnpMblZ1YzJocFpuUW9abTRwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lHWjFibU4wYVc5dUlISmxiVzkyWlV4cGMzUmxibVZ5S0dadUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMllYSWdhV1I0SUQwZ1gybHVaR1Y0VDJZb2JHbHpkR1Z1WlhKekxDQm1iaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvYVdSNElENDlJREFwSUd4cGMzUmxibVZ5Y3k1emNHeHBZMlVvYVdSNExDQXhLVHRjYmlBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCMFlYTnJRMjl0Y0d4bGRHVW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaVzFoYVc1cGJtZFVZWE5yY3kwdE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnWDJGeWNtRjVSV0ZqYUNoc2FYTjBaVzVsY25NdWMyeHBZMlVvTUNrc0lHWjFibU4wYVc5dUlDaG1iaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdadUtDazdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUdGa1pFeHBjM1JsYm1WeUtHWjFibU4wYVc5dUlDZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2doY21WdFlXbHVhVzVuVkdGemEzTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWh1ZFd4c0xDQnlaWE4xYkhSektUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZTazdYRzVjYmlBZ0lDQWdJQ0FnWDJGeWNtRjVSV0ZqYUNoclpYbHpMQ0JtZFc1amRHbHZiaUFvYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHaGhjMFZ5Y205eUtTQnlaWFIxY200N1hHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2RHRnpheUE5SUY5cGMwRnljbUY1S0hSaGMydHpXMnRkS1NBL0lIUmhjMnR6VzJ0ZE9pQmJkR0Z6YTNOYmExMWRPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJSFJoYzJ0RFlXeHNZbUZqYXlBOUlGOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNG9aWEp5TENCaGNtZHpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY25WdWJtbHVaMVJoYzJ0ekxTMDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0dGeVozTXViR1Z1WjNSb0lEdzlJREVwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZWEpuY3lBOUlHRnlaM05iTUYwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hsY25JcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlITmhabVZTWlhOMWJIUnpJRDBnZTMwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJRjltYjNKRllXTm9UMllvY21WemRXeDBjeXdnWm5WdVkzUnBiMjRvZG1Gc0xDQnlhMlY1S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCellXWmxVbVZ6ZFd4MGMxdHlhMlY1WFNBOUlIWmhiRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhOaFptVlNaWE4xYkhSelcydGRJRDBnWVhKbmN6dGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYUdGelJYSnliM0lnUFNCMGNuVmxPMXh1WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHVnljaXdnYzJGbVpWSmxjM1ZzZEhNcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVZ6ZFd4MGMxdHJYU0E5SUdGeVozTTdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGemVXNWpMbk5sZEVsdGJXVmthV0YwWlNoMFlYTnJRMjl0Y0d4bGRHVXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJSEpsY1hWcGNtVnpJRDBnZEdGemF5NXpiR2xqWlNnd0xDQjBZWE5yTG14bGJtZDBhQ0F0SURFcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z2NISmxkbVZ1ZENCa1pXRmtMV3h2WTJ0elhHNGdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2JHVnVJRDBnY21WeGRXbHlaWE11YkdWdVozUm9PMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR1JsY0R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSGRvYVd4bElDaHNaVzR0TFNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2doS0dSbGNDQTlJSFJoYzJ0elczSmxjWFZwY21WelcyeGxibDFkS1NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IwYUhKdmR5QnVaWGNnUlhKeWIzSW9KMGhoY3lCdWIyNWxlR2x6ZEdWdWRDQmtaWEJsYm1SbGJtTjVJR2x1SUNjZ0t5QnlaWEYxYVhKbGN5NXFiMmx1S0Njc0lDY3BLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tGOXBjMEZ5Y21GNUtHUmxjQ2tnSmlZZ1gybHVaR1Y0VDJZb1pHVndMQ0JyS1NBK1BTQXdLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2lnblNHRnpJR041WTJ4cFl5QmtaWEJsYm1SbGJtTnBaWE1uS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQnlaV0ZrZVNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2NuVnVibWx1WjFSaGMydHpJRHdnWTI5dVkzVnljbVZ1WTNrZ0ppWWdYM0psWkhWalpTaHlaWEYxYVhKbGN5d2dablZ1WTNScGIyNGdLR0VzSUhncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJQ2hoSUNZbUlISmxjM1ZzZEhNdWFHRnpUM2R1VUhKdmNHVnlkSGtvZUNrcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMHNJSFJ5ZFdVcElDWW1JQ0Z5WlhOMWJIUnpMbWhoYzA5M2JsQnliM0JsY25SNUtHc3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tISmxZV1I1S0NrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlkVzV1YVc1blZHRnphM01yS3p0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMFlYTnJXM1JoYzJzdWJHVnVaM1JvSUMwZ01WMG9kR0Z6YTBOaGJHeGlZV05yTENCeVpYTjFiSFJ6S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGa1pFeHBjM1JsYm1WeUtHeHBjM1JsYm1WeUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJR3hwYzNSbGJtVnlLQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsbUlDaHlaV0ZrZVNncEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhKMWJtNXBibWRVWVhOcmN5c3JPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpXMXZkbVZNYVhOMFpXNWxjaWhzYVhOMFpXNWxjaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUmhjMnRiZEdGemF5NXNaVzVuZEdnZ0xTQXhYU2gwWVhOclEyRnNiR0poWTJzc0lISmxjM1ZzZEhNcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ2ZUdGNibHh1WEc1Y2JpQWdJQ0JoYzNsdVl5NXlaWFJ5ZVNBOUlHWjFibU4wYVc5dUtIUnBiV1Z6TENCMFlYTnJMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCMllYSWdSRVZHUVZWTVZGOVVTVTFGVXlBOUlEVTdYRzRnSUNBZ0lDQWdJSFpoY2lCRVJVWkJWVXhVWDBsT1ZFVlNWa0ZNSUQwZ01EdGNibHh1SUNBZ0lDQWdJQ0IyWVhJZ1lYUjBaVzF3ZEhNZ1BTQmJYVHRjYmx4dUlDQWdJQ0FnSUNCMllYSWdiM0IwY3lBOUlIdGNiaUFnSUNBZ0lDQWdJQ0FnSUhScGJXVnpPaUJFUlVaQlZVeFVYMVJKVFVWVExGeHVJQ0FnSUNBZ0lDQWdJQ0FnYVc1MFpYSjJZV3c2SUVSRlJrRlZURlJmU1U1VVJWSldRVXhjYmlBZ0lDQWdJQ0FnZlR0Y2JseHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQndZWEp6WlZScGJXVnpLR0ZqWXl3Z2RDbDdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppaDBlWEJsYjJZZ2RDQTlQVDBnSjI1MWJXSmxjaWNwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGall5NTBhVzFsY3lBOUlIQmhjbk5sU1c1MEtIUXNJREV3S1NCOGZDQkVSVVpCVlV4VVgxUkpUVVZUTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElHbG1LSFI1Y0dWdlppQjBJRDA5UFNBbmIySnFaV04wSnlsN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1lXTmpMblJwYldWeklEMGdjR0Z5YzJWSmJuUW9kQzUwYVcxbGN5d2dNVEFwSUh4OElFUkZSa0ZWVEZSZlZFbE5SVk03WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWVdOakxtbHVkR1Z5ZG1Gc0lEMGdjR0Z5YzJWSmJuUW9kQzVwYm5SbGNuWmhiQ3dnTVRBcElIeDhJRVJGUmtGVlRGUmZTVTVVUlZKV1FVdzdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhSb2NtOTNJRzVsZHlCRmNuSnZjaWduVlc1emRYQndiM0owWldRZ1lYSm5kVzFsYm5RZ2RIbHdaU0JtYjNJZ1hGd25kR2x0WlhOY1hDYzZJQ2NnS3lCMGVYQmxiMllnZENrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgxY2JseHVJQ0FnSUNBZ0lDQjJZWElnYkdWdVozUm9JRDBnWVhKbmRXMWxiblJ6TG14bGJtZDBhRHRjYmlBZ0lDQWdJQ0FnYVdZZ0tHeGxibWQwYUNBOElERWdmSHdnYkdWdVozUm9JRDRnTXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2RKYm5aaGJHbGtJR0Z5WjNWdFpXNTBjeUF0SUcxMWMzUWdZbVVnWldsMGFHVnlJQ2gwWVhOcktTd2dLSFJoYzJzc0lHTmhiR3hpWVdOcktTd2dLSFJwYldWekxDQjBZWE5yS1NCdmNpQW9kR2x0WlhNc0lIUmhjMnNzSUdOaGJHeGlZV05yS1NjcE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2FXWWdLR3hsYm1kMGFDQThQU0F5SUNZbUlIUjVjR1Z2WmlCMGFXMWxjeUE5UFQwZ0oyWjFibU4wYVc5dUp5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzZ1BTQjBZWE5yTzF4dUlDQWdJQ0FnSUNBZ0lDQWdkR0Z6YXlBOUlIUnBiV1Z6TzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lHbG1JQ2gwZVhCbGIyWWdkR2x0WlhNZ0lUMDlJQ2RtZFc1amRHbHZiaWNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEJoY25ObFZHbHRaWE1vYjNCMGN5d2dkR2x0WlhNcE8xeHVJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJRzl3ZEhNdVkyRnNiR0poWTJzZ1BTQmpZV3hzWW1GamF6dGNiaUFnSUNBZ0lDQWdiM0IwY3k1MFlYTnJJRDBnZEdGemF6dGNibHh1SUNBZ0lDQWdJQ0JtZFc1amRHbHZiaUIzY21Gd2NHVmtWR0Z6YXloM2NtRndjR1ZrUTJGc2JHSmhZMnNzSUhkeVlYQndaV1JTWlhOMWJIUnpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQnlaWFJ5ZVVGMGRHVnRjSFFvZEdGemF5d2dabWx1WVd4QmRIUmxiWEIwS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1S0hObGNtbGxjME5oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUmhjMnNvWm5WdVkzUnBiMjRvWlhKeUxDQnlaWE4xYkhRcGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2MyVnlhV1Z6UTJGc2JHSmhZMnNvSVdWeWNpQjhmQ0JtYVc1aGJFRjBkR1Z0Y0hRc0lIdGxjbkk2SUdWeWNpd2djbVZ6ZFd4ME9pQnlaWE4xYkhSOUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlN3Z2QzSmhjSEJsWkZKbGMzVnNkSE1wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJSEpsZEhKNVNXNTBaWEoyWVd3b2FXNTBaWEoyWVd3cGUxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmloelpYSnBaWE5EWVd4c1ltRmpheWw3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lITmxkRlJwYldWdmRYUW9ablZ1WTNScGIyNG9LWHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSE5sY21sbGMwTmhiR3hpWVdOcktHNTFiR3dwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlMQ0JwYm5SbGNuWmhiQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdkMmhwYkdVZ0tHOXdkSE11ZEdsdFpYTXBJSHRjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhaaGNpQm1hVzVoYkVGMGRHVnRjSFFnUFNBaEtHOXdkSE11ZEdsdFpYTXRQVEVwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGMGRHVnRjSFJ6TG5CMWMyZ29jbVYwY25sQmRIUmxiWEIwS0c5d2RITXVkR0Z6YXl3Z1ptbHVZV3hCZEhSbGJYQjBLU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZb0lXWnBibUZzUVhSMFpXMXdkQ0FtSmlCdmNIUnpMbWx1ZEdWeWRtRnNJRDRnTUNsN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR0YwZEdWdGNIUnpMbkIxYzJnb2NtVjBjbmxKYm5SbGNuWmhiQ2h2Y0hSekxtbHVkR1Z5ZG1Gc0tTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJQ0FnSUNCaGMzbHVZeTV6WlhKcFpYTW9ZWFIwWlcxd2RITXNJR1oxYm1OMGFXOXVLR1J2Ym1Vc0lHUmhkR0VwZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdSaGRHRWdQU0JrWVhSaFcyUmhkR0V1YkdWdVozUm9JQzBnTVYwN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0tIZHlZWEJ3WldSRFlXeHNZbUZqYXlCOGZDQnZjSFJ6TG1OaGJHeGlZV05yS1Noa1lYUmhMbVZ5Y2l3Z1pHRjBZUzV5WlhOMWJIUXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNBdkx5QkpaaUJoSUdOaGJHeGlZV05ySUdseklIQmhjM05sWkN3Z2NuVnVJSFJvYVhNZ1lYTWdZU0JqYjI1MGNtOXNiQ0JtYkc5M1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCdmNIUnpMbU5oYkd4aVlXTnJJRDhnZDNKaGNIQmxaRlJoYzJzb0tTQTZJSGR5WVhCd1pXUlVZWE5yTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JoYzNsdVl5NTNZWFJsY21aaGJHd2dQU0JtZFc1amRHbHZiaUFvZEdGemEzTXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUdOaGJHeGlZV05ySUQwZ1gyOXVZMlVvWTJGc2JHSmhZMnNnZkh3Z2JtOXZjQ2s3WEc0Z0lDQWdJQ0FnSUdsbUlDZ2hYMmx6UVhKeVlYa29kR0Z6YTNNcEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMllYSWdaWEp5SUQwZ2JtVjNJRVZ5Y205eUtDZEdhWEp6ZENCaGNtZDFiV1Z1ZENCMGJ5QjNZWFJsY21aaGJHd2diWFZ6ZENCaVpTQmhiaUJoY25KaGVTQnZaaUJtZFc1amRHbHZibk1uS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmpZV3hzWW1GamF5aGxjbklwTzF4dUlDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lHbG1JQ2doZEdGemEzTXViR1Z1WjNSb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWTJGc2JHSmhZMnNvS1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQjNjbUZ3U1hSbGNtRjBiM0lvYVhSbGNtRjBiM0lwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmZjbVZ6ZEZCaGNtRnRLR1oxYm1OMGFXOXVJQ2hsY25Jc0lHRnlaM01wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9aWEp5S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJMbUZ3Y0d4NUtHNTFiR3dzSUZ0bGNuSmRMbU52Ym1OaGRDaGhjbWR6S1NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnYm1WNGRDQTlJR2wwWlhKaGRHOXlMbTVsZUhRb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHNWxlSFFwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdGeVozTXVjSFZ6YUNoM2NtRndTWFJsY21GMGIzSW9ibVY0ZENrcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWVhKbmN5NXdkWE5vS0dOaGJHeGlZV05yS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbGJuTjFjbVZCYzNsdVl5aHBkR1Z5WVhSdmNpa3VZWEJ3Ykhrb2JuVnNiQ3dnWVhKbmN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnZDNKaGNFbDBaWEpoZEc5eUtHRnplVzVqTG1sMFpYSmhkRzl5S0hSaGMydHpLU2tvS1R0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnWm5WdVkzUnBiMjRnWDNCaGNtRnNiR1ZzS0dWaFkyaG1iaXdnZEdGemEzTXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUdOaGJHeGlZV05ySUQwZ1kyRnNiR0poWTJzZ2ZId2dibTl2Y0R0Y2JpQWdJQ0FnSUNBZ2RtRnlJSEpsYzNWc2RITWdQU0JmYVhOQmNuSmhlVXhwYTJVb2RHRnphM01wSUQ4Z1cxMGdPaUI3ZlR0Y2JseHVJQ0FnSUNBZ0lDQmxZV05vWm00b2RHRnphM01zSUdaMWJtTjBhVzl1SUNoMFlYTnJMQ0JyWlhrc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMFlYTnJLRjl5WlhOMFVHRnlZVzBvWm5WdVkzUnBiMjRnS0dWeWNpd2dZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hoY21kekxteGxibWQwYUNBOFBTQXhLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRnlaM01nUFNCaGNtZHpXekJkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYTjFiSFJ6VzJ0bGVWMGdQU0JoY21kek8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktHVnljaWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlLU2s3WEc0Z0lDQWdJQ0FnSUgwc0lHWjFibU4wYVc5dUlDaGxjbklwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLR1Z5Y2l3Z2NtVnpkV3gwY3lrN1hHNGdJQ0FnSUNBZ0lIMHBPMXh1SUNBZ0lIMWNibHh1SUNBZ0lHRnplVzVqTG5CaGNtRnNiR1ZzSUQwZ1puVnVZM1JwYjI0Z0tIUmhjMnR6TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQmZjR0Z5WVd4c1pXd29ZWE41Ym1NdVpXRmphRTltTENCMFlYTnJjeXdnWTJGc2JHSmhZMnNwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JoYzNsdVl5NXdZWEpoYkd4bGJFeHBiV2wwSUQwZ1puVnVZM1JwYjI0b2RHRnphM01zSUd4cGJXbDBMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCZmNHRnlZV3hzWld3b1gyVmhZMmhQWmt4cGJXbDBLR3hwYldsMEtTd2dkR0Z6YTNNc0lHTmhiR3hpWVdOcktUdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11YzJWeWFXVnpJRDBnWm5WdVkzUnBiMjRvZEdGemEzTXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUY5d1lYSmhiR3hsYkNoaGMzbHVZeTVsWVdOb1QyWlRaWEpwWlhNc0lIUmhjMnR6TENCallXeHNZbUZqYXlrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbWwwWlhKaGRHOXlJRDBnWm5WdVkzUnBiMjRnS0hSaGMydHpLU0I3WEc0Z0lDQWdJQ0FnSUdaMWJtTjBhVzl1SUcxaGEyVkRZV3hzWW1GamF5aHBibVJsZUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnWm00b0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hSaGMydHpMbXhsYm1kMGFDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMFlYTnJjMXRwYm1SbGVGMHVZWEJ3Ykhrb2JuVnNiQ3dnWVhKbmRXMWxiblJ6S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2NtVjBkWEp1SUdadUxtNWxlSFFvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lHWnVMbTVsZUhRZ1BTQm1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJQ2hwYm1SbGVDQThJSFJoYzJ0ekxteGxibWQwYUNBdElERXBJRDhnYldGclpVTmhiR3hpWVdOcktHbHVaR1Y0SUNzZ01TazZJRzUxYkd3N1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5TzF4dUlDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHWnVPMXh1SUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJ0WVd0bFEyRnNiR0poWTJzb01DazdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHRnplVzVqTG1Gd2NHeDVJRDBnWDNKbGMzUlFZWEpoYlNobWRXNWpkR2x2YmlBb1ptNHNJR0Z5WjNNcElIdGNiaUFnSUNBZ0lDQWdjbVYwZFhKdUlGOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNGdLR05oYkd4QmNtZHpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z1ptNHVZWEJ3Ykhrb1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2JuVnNiQ3dnWVhKbmN5NWpiMjVqWVhRb1kyRnNiRUZ5WjNNcFhHNGdJQ0FnSUNBZ0lDQWdJQ0FwTzF4dUlDQWdJQ0FnSUNCOUtUdGNiaUFnSUNCOUtUdGNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOWpiMjVqWVhRb1pXRmphR1p1TENCaGNuSXNJR1p1TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQjJZWElnY21WemRXeDBJRDBnVzEwN1hHNGdJQ0FnSUNBZ0lHVmhZMmhtYmloaGNuSXNJR1oxYm1OMGFXOXVJQ2g0TENCcGJtUmxlQ3dnWTJJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUdadUtIZ3NJR1oxYm1OMGFXOXVJQ2hsY25Jc0lIa3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMWJIUWdQU0J5WlhOMWJIUXVZMjl1WTJGMEtIa2dmSHdnVzEwcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmlLR1Z5Y2lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ2ZTd2dablZ1WTNScGIyNGdLR1Z5Y2lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvWlhKeUxDQnlaWE4xYkhRcE8xeHVJQ0FnSUNBZ0lDQjlLVHRjYmlBZ0lDQjlYRzRnSUNBZ1lYTjVibU11WTI5dVkyRjBJRDBnWkc5UVlYSmhiR3hsYkNoZlkyOXVZMkYwS1R0Y2JpQWdJQ0JoYzNsdVl5NWpiMjVqWVhSVFpYSnBaWE1nUFNCa2IxTmxjbWxsY3loZlkyOXVZMkYwS1R0Y2JseHVJQ0FnSUdGemVXNWpMbmRvYVd4emRDQTlJR1oxYm1OMGFXOXVJQ2gwWlhOMExDQnBkR1Z5WVhSdmNpd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNnUFNCallXeHNZbUZqYXlCOGZDQnViMjl3TzF4dUlDQWdJQ0FnSUNCcFppQW9kR1Z6ZENncEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCMllYSWdibVY0ZENBOUlGOXlaWE4wVUdGeVlXMG9ablZ1WTNScGIyNG9aWEp5TENCaGNtZHpLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHVnljaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aGxjbklwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgwZ1pXeHpaU0JwWmlBb2RHVnpkQzVoY0hCc2VTaDBhR2x6TENCaGNtZHpLU2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnBkR1Z5WVhSdmNpaHVaWGgwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5NWhjSEJzZVNodWRXeHNMQ0JiYm5Wc2JGMHVZMjl1WTJGMEtHRnlaM01wS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2wwWlhKaGRHOXlLRzVsZUhRcE8xeHVJQ0FnSUNBZ0lDQjlJR1ZzYzJVZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvYm5Wc2JDazdYRzRnSUNBZ0lDQWdJSDFjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdZWE41Ym1NdVpHOVhhR2xzYzNRZ1BTQm1kVzVqZEdsdmJpQW9hWFJsY21GMGIzSXNJSFJsYzNRc0lHTmhiR3hpWVdOcktTQjdYRzRnSUNBZ0lDQWdJSFpoY2lCallXeHNjeUE5SURBN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZeTUzYUdsc2MzUW9ablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z0t5dGpZV3hzY3lBOFBTQXhJSHg4SUhSbGMzUXVZWEJ3Ykhrb2RHaHBjeXdnWVhKbmRXMWxiblJ6S1R0Y2JpQWdJQ0FnSUNBZ2ZTd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdZWE41Ym1NdWRXNTBhV3dnUFNCbWRXNWpkR2x2YmlBb2RHVnpkQ3dnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZeTUzYUdsc2MzUW9ablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z0lYUmxjM1F1WVhCd2JIa29kR2hwY3l3Z1lYSm5kVzFsYm5SektUdGNiaUFnSUNBZ0lDQWdmU3dnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0I5TzF4dVhHNGdJQ0FnWVhONWJtTXVaRzlWYm5ScGJDQTlJR1oxYm1OMGFXOXVJQ2hwZEdWeVlYUnZjaXdnZEdWemRDd2dZMkZzYkdKaFkyc3BJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR0Z6ZVc1akxtUnZWMmhwYkhOMEtHbDBaWEpoZEc5eUxDQm1kVzVqZEdsdmJpZ3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlBaGRHVnpkQzVoY0hCc2VTaDBhR2x6TENCaGNtZDFiV1Z1ZEhNcE8xeHVJQ0FnSUNBZ0lDQjlMQ0JqWVd4c1ltRmpheWs3WEc0Z0lDQWdmVHRjYmx4dUlDQWdJR0Z6ZVc1akxtUjFjbWx1WnlBOUlHWjFibU4wYVc5dUlDaDBaWE4wTENCcGRHVnlZWFJ2Y2l3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdZMkZzYkdKaFkyc2dQU0JqWVd4c1ltRmpheUI4ZkNCdWIyOXdPMXh1WEc0Z0lDQWdJQ0FnSUhaaGNpQnVaWGgwSUQwZ1gzSmxjM1JRWVhKaGJTaG1kVzVqZEdsdmJpaGxjbklzSUdGeVozTXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2hsY25JcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpZV3hzWW1GamF5aGxjbklwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmhjbWR6TG5CMWMyZ29ZMmhsWTJzcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUmxjM1F1WVhCd2JIa29kR2hwY3l3Z1lYSm5jeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJSDBwTzF4dVhHNGdJQ0FnSUNBZ0lIWmhjaUJqYUdWamF5QTlJR1oxYm1OMGFXOXVLR1Z5Y2l3Z2RISjFkR2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJR2xtSUNobGNuSXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWhsY25JcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNCbGJITmxJR2xtSUNoMGNuVjBhQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdsMFpYSmhkRzl5S0c1bGVIUXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXlodWRXeHNLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdmVHRjYmx4dUlDQWdJQ0FnSUNCMFpYTjBLR05vWldOcktUdGNiaUFnSUNCOU8xeHVYRzRnSUNBZ1lYTjVibU11Wkc5RWRYSnBibWNnUFNCbWRXNWpkR2x2YmlBb2FYUmxjbUYwYjNJc0lIUmxjM1FzSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lIWmhjaUJqWVd4c2N5QTlJREE3WEc0Z0lDQWdJQ0FnSUdGemVXNWpMbVIxY21sdVp5aG1kVzVqZEdsdmJpaHVaWGgwS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1kyRnNiSE1yS3lBOElERXBJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J1WlhoMEtHNTFiR3dzSUhSeWRXVXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTQmxiSE5sSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMFpYTjBMbUZ3Y0d4NUtIUm9hWE1zSUdGeVozVnRaVzUwY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgwc0lHbDBaWEpoZEc5eUxDQmpZV3hzWW1GamF5azdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHWjFibU4wYVc5dUlGOXhkV1YxWlNoM2IzSnJaWElzSUdOdmJtTjFjbkpsYm1ONUxDQndZWGxzYjJGa0tTQjdYRzRnSUNBZ0lDQWdJR2xtSUNoamIyNWpkWEp5Wlc1amVTQTlQU0J1ZFd4c0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCamIyNWpkWEp5Wlc1amVTQTlJREU3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ1pXeHpaU0JwWmloamIyNWpkWEp5Wlc1amVTQTlQVDBnTUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdoeWIzY2dibVYzSUVWeWNtOXlLQ2REYjI1amRYSnlaVzVqZVNCdGRYTjBJRzV2ZENCaVpTQjZaWEp2SnlrN1hHNGdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdablZ1WTNScGIyNGdYMmx1YzJWeWRDaHhMQ0JrWVhSaExDQndiM01zSUdOaGJHeGlZV05yS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JwWmlBb1kyRnNiR0poWTJzZ0lUMGdiblZzYkNBbUppQjBlWEJsYjJZZ1kyRnNiR0poWTJzZ0lUMDlJRndpWm5WdVkzUnBiMjVjSWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIUm9jbTkzSUc1bGR5QkZjbkp2Y2loY0luUmhjMnNnWTJGc2JHSmhZMnNnYlhWemRDQmlaU0JoSUdaMWJtTjBhVzl1WENJcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdjUzV6ZEdGeWRHVmtJRDBnZEhKMVpUdGNiaUFnSUNBZ0lDQWdJQ0FnSUdsbUlDZ2hYMmx6UVhKeVlYa29aR0YwWVNrcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtZWFJoSUQwZ1cyUmhkR0ZkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2FXWW9aR0YwWVM1c1pXNW5kR2dnUFQwOUlEQWdKaVlnY1M1cFpHeGxLQ2twSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBdkx5QmpZV3hzSUdSeVlXbHVJR2x0YldWa2FXRjBaV3g1SUdsbUlIUm9aWEpsSUdGeVpTQnVieUIwWVhOcmMxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCaGMzbHVZeTV6WlhSSmJXMWxaR2xoZEdVb1puVnVZM1JwYjI0b0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdVpISmhhVzRvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJRjloY25KaGVVVmhZMmdvWkdGMFlTd2dablZ1WTNScGIyNG9kR0Z6YXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIWmhjaUJwZEdWdElEMGdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCa1lYUmhPaUIwWVhOckxGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmphem9nWTJGc2JHSmhZMnNnZkh3Z2JtOXZjRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDA3WEc1Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9jRzl6S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1ZEdGemEzTXVkVzV6YUdsbWRDaHBkR1Z0S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnhMblJoYzJ0ekxuQjFjMmdvYVhSbGJTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIRXVkR0Z6YTNNdWJHVnVaM1JvSUQwOVBTQnhMbU52Ym1OMWNuSmxibU41S1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1YzJGMGRYSmhkR1ZrS0NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0JoYzNsdVl5NXpaWFJKYlcxbFpHbGhkR1VvY1M1d2NtOWpaWE56S1R0Y2JpQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQm1kVzVqZEdsdmJpQmZibVY0ZENoeExDQjBZWE5yY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVLQ2w3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZDI5eWEyVnljeUF0UFNBeE8xeHVYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUhKbGJXOTJaV1FnUFNCbVlXeHpaVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ1lYSm5jeUE5SUdGeVozVnRaVzUwY3p0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCZllYSnlZWGxGWVdOb0tIUmhjMnR6TENCbWRXNWpkR2x2YmlBb2RHRnpheWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmZZWEp5WVhsRllXTm9LSGR2Y210bGNuTk1hWE4wTENCbWRXNWpkR2x2YmlBb2QyOXlhMlZ5TENCcGJtUmxlQ2tnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIZHZjbXRsY2lBOVBUMGdkR0Z6YXlBbUppQWhjbVZ0YjNabFpDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhkdmNtdGxjbk5NYVhOMExuTndiR2xqWlNocGJtUmxlQ3dnTVNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVZ0YjNabFpDQTlJSFJ5ZFdVN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dVhHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFJoYzJzdVkyRnNiR0poWTJzdVlYQndiSGtvZEdGemF5d2dZWEpuY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdhV1lnS0hFdWRHRnphM011YkdWdVozUm9JQ3NnZDI5eWEyVnljeUE5UFQwZ01Da2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeExtUnlZV2x1S0NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZWeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRXVjSEp2WTJWemN5Z3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2ZUdGNiaUFnSUNBZ0lDQWdmVnh1WEc0Z0lDQWdJQ0FnSUhaaGNpQjNiM0pyWlhKeklEMGdNRHRjYmlBZ0lDQWdJQ0FnZG1GeUlIZHZjbXRsY25OTWFYTjBJRDBnVzEwN1hHNGdJQ0FnSUNBZ0lIWmhjaUJ4SUQwZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZEdGemEzTTZJRnRkTEZ4dUlDQWdJQ0FnSUNBZ0lDQWdZMjl1WTNWeWNtVnVZM2s2SUdOdmJtTjFjbkpsYm1ONUxGeHVJQ0FnSUNBZ0lDQWdJQ0FnY0dGNWJHOWhaRG9nY0dGNWJHOWhaQ3hjYmlBZ0lDQWdJQ0FnSUNBZ0lITmhkSFZ5WVhSbFpEb2dibTl2Y0N4Y2JpQWdJQ0FnSUNBZ0lDQWdJR1Z0Y0hSNU9pQnViMjl3TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdaSEpoYVc0NklHNXZiM0FzWEc0Z0lDQWdJQ0FnSUNBZ0lDQnpkR0Z5ZEdWa09pQm1ZV3h6WlN4Y2JpQWdJQ0FnSUNBZ0lDQWdJSEJoZFhObFpEb2dabUZzYzJVc1hHNGdJQ0FnSUNBZ0lDQWdJQ0J3ZFhOb09pQm1kVzVqZEdsdmJpQW9aR0YwWVN3Z1kyRnNiR0poWTJzcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmZhVzV6WlhKMEtIRXNJR1JoZEdFc0lHWmhiSE5sTENCallXeHNZbUZqYXlrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdhMmxzYkRvZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1WkhKaGFXNGdQU0J1YjI5d08xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIRXVkR0Z6YTNNZ1BTQmJYVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHNYRzRnSUNBZ0lDQWdJQ0FnSUNCMWJuTm9hV1owT2lCbWRXNWpkR2x2YmlBb1pHRjBZU3dnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCZmFXNXpaWEowS0hFc0lHUmhkR0VzSUhSeWRXVXNJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHNYRzRnSUNBZ0lDQWdJQ0FnSUNCd2NtOWpaWE56T2lCbWRXNWpkR2x2YmlBb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdkMmhwYkdVb0lYRXVjR0YxYzJWa0lDWW1JSGR2Y210bGNuTWdQQ0J4TG1OdmJtTjFjbkpsYm1ONUlDWW1JSEV1ZEdGemEzTXViR1Z1WjNSb0tYdGNibHh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllYSWdkR0Z6YTNNZ1BTQnhMbkJoZVd4dllXUWdQMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjUzUwWVhOcmN5NXpjR3hwWTJVb01Dd2djUzV3WVhsc2IyRmtLU0E2WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J4TG5SaGMydHpMbk53YkdsalpTZ3dMQ0J4TG5SaGMydHpMbXhsYm1kMGFDazdYRzVjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR1JoZEdFZ1BTQmZiV0Z3S0hSaGMydHpMQ0JtZFc1amRHbHZiaUFvZEdGemF5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlIUmhjMnN1WkdGMFlUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIRXVkR0Z6YTNNdWJHVnVaM1JvSUQwOVBTQXdLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J4TG1WdGNIUjVLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lIMWNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZDI5eWEyVnljeUFyUFNBeE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IzYjNKclpYSnpUR2x6ZEM1d2RYTm9LSFJoYzJ0eld6QmRLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR05pSUQwZ2IyNXNlVjl2Ym1ObEtGOXVaWGgwS0hFc0lIUmhjMnR6S1NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSGR2Y210bGNpaGtZWFJoTENCallpazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ2ZTeGNiaUFnSUNBZ0lDQWdJQ0FnSUd4bGJtZDBhRG9nWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCeExuUmhjMnR6TG14bGJtZDBhRHRjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHNYRzRnSUNBZ0lDQWdJQ0FnSUNCeWRXNXVhVzVuT2lCbWRXNWpkR2x2YmlBb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlIZHZjbXRsY25NN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdkMjl5YTJWeWMweHBjM1E2SUdaMWJtTjBhVzl1SUNncElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnlaWFIxY200Z2QyOXlhMlZ5YzB4cGMzUTdYRzRnSUNBZ0lDQWdJQ0FnSUNCOUxGeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdSc1pUb2dablZ1WTNScGIyNG9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJSEV1ZEdGemEzTXViR1Z1WjNSb0lDc2dkMjl5YTJWeWN5QTlQVDBnTUR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBzWEc0Z0lDQWdJQ0FnSUNBZ0lDQndZWFZ6WlRvZ1puVnVZM1JwYjI0Z0tDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEV1Y0dGMWMyVmtJRDBnZEhKMVpUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwc1hHNGdJQ0FnSUNBZ0lDQWdJQ0J5WlhOMWJXVTZJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9jUzV3WVhWelpXUWdQVDA5SUdaaGJITmxLU0I3SUhKbGRIVnlianNnZlZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdWNHRjFjMlZrSUQwZ1ptRnNjMlU3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZG1GeUlISmxjM1Z0WlVOdmRXNTBJRDBnVFdGMGFDNXRhVzRvY1M1amIyNWpkWEp5Wlc1amVTd2djUzUwWVhOcmN5NXNaVzVuZEdncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDOHZJRTVsWldRZ2RHOGdZMkZzYkNCeExuQnliMk5sYzNNZ2IyNWpaU0J3WlhJZ1kyOXVZM1Z5Y21WdWRGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDOHZJSGR2Y210bGNpQjBieUJ3Y21WelpYSjJaU0JtZFd4c0lHTnZibU4xY25KbGJtTjVJR0ZtZEdWeUlIQmhkWE5sWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWm05eUlDaDJZWElnZHlBOUlERTdJSGNnUEQwZ2NtVnpkVzFsUTI5MWJuUTdJSGNyS3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JoYzNsdVl5NXpaWFJKYlcxbFpHbGhkR1VvY1M1d2NtOWpaWE56S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgwN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCeE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdGemVXNWpMbkYxWlhWbElEMGdablZ1WTNScGIyNGdLSGR2Y210bGNpd2dZMjl1WTNWeWNtVnVZM2twSUh0Y2JpQWdJQ0FnSUNBZ2RtRnlJSEVnUFNCZmNYVmxkV1VvWm5WdVkzUnBiMjRnS0dsMFpXMXpMQ0JqWWlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnZDI5eWEyVnlLR2wwWlcxeld6QmRMQ0JqWWlrN1hHNGdJQ0FnSUNBZ0lIMHNJR052Ym1OMWNuSmxibU41TENBeEtUdGNibHh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdjVHRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdZWE41Ym1NdWNISnBiM0pwZEhsUmRXVjFaU0E5SUdaMWJtTjBhVzl1SUNoM2IzSnJaWElzSUdOdmJtTjFjbkpsYm1ONUtTQjdYRzVjYmlBZ0lDQWdJQ0FnWm5WdVkzUnBiMjRnWDJOdmJYQmhjbVZVWVhOcmN5aGhMQ0JpS1h0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmhMbkJ5YVc5eWFYUjVJQzBnWWk1d2NtbHZjbWwwZVR0Y2JpQWdJQ0FnSUNBZ2ZWeHVYRzRnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJRjlpYVc1aGNubFRaV0Z5WTJnb2MyVnhkV1Z1WTJVc0lHbDBaVzBzSUdOdmJYQmhjbVVwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCaVpXY2dQU0F0TVN4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCbGJtUWdQU0J6WlhGMVpXNWpaUzVzWlc1bmRHZ2dMU0F4TzF4dUlDQWdJQ0FnSUNBZ0lDQWdkMmhwYkdVZ0tHSmxaeUE4SUdWdVpDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCdGFXUWdQU0JpWldjZ0t5QW9LR1Z1WkNBdElHSmxaeUFySURFcElENCtQaUF4S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9ZMjl0Y0dGeVpTaHBkR1Z0TENCelpYRjFaVzVqWlZ0dGFXUmRLU0ErUFNBd0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdKbFp5QTlJRzFwWkR0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUlHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmxibVFnUFNCdGFXUWdMU0F4TzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCaVpXYzdYRzRnSUNBZ0lDQWdJSDFjYmx4dUlDQWdJQ0FnSUNCbWRXNWpkR2x2YmlCZmFXNXpaWEowS0hFc0lHUmhkR0VzSUhCeWFXOXlhWFI1TENCallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHTmhiR3hpWVdOcklDRTlJRzUxYkd3Z0ppWWdkSGx3Wlc5bUlHTmhiR3hpWVdOcklDRTlQU0JjSW1aMWJtTjBhVzl1WENJcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjBhSEp2ZHlCdVpYY2dSWEp5YjNJb1hDSjBZWE5ySUdOaGJHeGlZV05ySUcxMWMzUWdZbVVnWVNCbWRXNWpkR2x2Ymx3aUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSEV1YzNSaGNuUmxaQ0E5SUhSeWRXVTdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9JVjlwYzBGeWNtRjVLR1JoZEdFcEtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaR0YwWVNBOUlGdGtZWFJoWFR0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lHbG1LR1JoZEdFdWJHVnVaM1JvSUQwOVBTQXdLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnTHk4Z1kyRnNiQ0JrY21GcGJpQnBiVzFsWkdsaGRHVnNlU0JwWmlCMGFHVnlaU0JoY21VZ2JtOGdkR0Z6YTNOY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnWVhONWJtTXVjMlYwU1cxdFpXUnBZWFJsS0daMWJtTjBhVzl1S0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0J4TG1SeVlXbHVLQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmZZWEp5WVhsRllXTm9LR1JoZEdFc0lHWjFibU4wYVc5dUtIUmhjMnNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCMllYSWdhWFJsYlNBOUlIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWkdGMFlUb2dkR0Z6YXl4Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjSEpwYjNKcGRIazZJSEJ5YVc5eWFYUjVMRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCallXeHNZbUZqYXpvZ2RIbHdaVzltSUdOaGJHeGlZV05ySUQwOVBTQW5ablZ1WTNScGIyNG5JRDhnWTJGc2JHSmhZMnNnT2lCdWIyOXdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVHRjYmx4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhFdWRHRnphM011YzNCc2FXTmxLRjlpYVc1aGNubFRaV0Z5WTJnb2NTNTBZWE5yY3l3Z2FYUmxiU3dnWDJOdmJYQmhjbVZVWVhOcmN5a2dLeUF4TENBd0xDQnBkR1Z0S1R0Y2JseHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHbG1JQ2h4TG5SaGMydHpMbXhsYm1kMGFDQTlQVDBnY1M1amIyNWpkWEp5Wlc1amVTa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeExuTmhkSFZ5WVhSbFpDZ3BPMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JoYzNsdVl5NXpaWFJKYlcxbFpHbGhkR1VvY1M1d2NtOWpaWE56S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBwTzF4dUlDQWdJQ0FnSUNCOVhHNWNiaUFnSUNBZ0lDQWdMeThnVTNSaGNuUWdkMmwwYUNCaElHNXZjbTFoYkNCeGRXVjFaVnh1SUNBZ0lDQWdJQ0IyWVhJZ2NTQTlJR0Z6ZVc1akxuRjFaWFZsS0hkdmNtdGxjaXdnWTI5dVkzVnljbVZ1WTNrcE8xeHVYRzRnSUNBZ0lDQWdJQzh2SUU5MlpYSnlhV1JsSUhCMWMyZ2dkRzhnWVdOalpYQjBJSE5sWTI5dVpDQndZWEpoYldWMFpYSWdjbVZ3Y21WelpXNTBhVzVuSUhCeWFXOXlhWFI1WEc0Z0lDQWdJQ0FnSUhFdWNIVnphQ0E5SUdaMWJtTjBhVzl1SUNoa1lYUmhMQ0J3Y21sdmNtbDBlU3dnWTJGc2JHSmhZMnNwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJRjlwYm5ObGNuUW9jU3dnWkdGMFlTd2djSEpwYjNKcGRIa3NJR05oYkd4aVlXTnJLVHRjYmlBZ0lDQWdJQ0FnZlR0Y2JseHVJQ0FnSUNBZ0lDQXZMeUJTWlcxdmRtVWdkVzV6YUdsbWRDQm1kVzVqZEdsdmJseHVJQ0FnSUNBZ0lDQmtaV3hsZEdVZ2NTNTFibk5vYVdaME8xeHVYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQnhPMXh1SUNBZ0lIMDdYRzVjYmlBZ0lDQmhjM2x1WXk1allYSm5ieUE5SUdaMWJtTjBhVzl1SUNoM2IzSnJaWElzSUhCaGVXeHZZV1FwSUh0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUY5eGRXVjFaU2gzYjNKclpYSXNJREVzSUhCaGVXeHZZV1FwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JtZFc1amRHbHZiaUJmWTI5dWMyOXNaVjltYmlodVlXMWxLU0I3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJmY21WemRGQmhjbUZ0S0daMWJtTjBhVzl1SUNobWJpd2dZWEpuY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnWm00dVlYQndiSGtvYm5Wc2JDd2dZWEpuY3k1amIyNWpZWFFvVzE5eVpYTjBVR0Z5WVcwb1puVnVZM1JwYjI0Z0tHVnljaXdnWVhKbmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR2xtSUNoMGVYQmxiMllnWTI5dWMyOXNaU0E5UFQwZ0oyOWlhbVZqZENjcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHVnljaWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHTnZibk52YkdVdVpYSnliM0lwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmpiMjV6YjJ4bExtVnljbTl5S0dWeWNpazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdaV3h6WlNCcFppQW9ZMjl1YzI5c1pWdHVZVzFsWFNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1gyRnljbUY1UldGamFDaGhjbWR6TENCbWRXNWpkR2x2YmlBb2VDa2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdOdmJuTnZiR1ZiYm1GdFpWMG9lQ2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lIMHBYU2twTzF4dUlDQWdJQ0FnSUNCOUtUdGNiaUFnSUNCOVhHNGdJQ0FnWVhONWJtTXViRzluSUQwZ1gyTnZibk52YkdWZlptNG9KMnh2WnljcE8xeHVJQ0FnSUdGemVXNWpMbVJwY2lBOUlGOWpiMjV6YjJ4bFgyWnVLQ2RrYVhJbktUdGNiaUFnSUNBdkttRnplVzVqTG1sdVptOGdQU0JmWTI5dWMyOXNaVjltYmlnbmFXNW1ieWNwTzF4dUlDQWdJR0Z6ZVc1akxuZGhjbTRnUFNCZlkyOXVjMjlzWlY5bWJpZ25kMkZ5YmljcE8xeHVJQ0FnSUdGemVXNWpMbVZ5Y205eUlEMGdYMk52Ym5OdmJHVmZabTRvSjJWeWNtOXlKeWs3S2k5Y2JseHVJQ0FnSUdGemVXNWpMbTFsYlc5cGVtVWdQU0JtZFc1amRHbHZiaUFvWm00c0lHaGhjMmhsY2lrZ2UxeHVJQ0FnSUNBZ0lDQjJZWElnYldWdGJ5QTlJSHQ5TzF4dUlDQWdJQ0FnSUNCMllYSWdjWFZsZFdWeklEMGdlMzA3WEc0Z0lDQWdJQ0FnSUhaaGNpQm9ZWE1nUFNCUFltcGxZM1F1Y0hKdmRHOTBlWEJsTG1oaGMwOTNibEJ5YjNCbGNuUjVPMXh1SUNBZ0lDQWdJQ0JvWVhOb1pYSWdQU0JvWVhOb1pYSWdmSHdnYVdSbGJuUnBkSGs3WEc0Z0lDQWdJQ0FnSUhaaGNpQnRaVzF2YVhwbFpDQTlJRjl5WlhOMFVHRnlZVzBvWm5WdVkzUnBiMjRnYldWdGIybDZaV1FvWVhKbmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR05oYkd4aVlXTnJJRDBnWVhKbmN5NXdiM0FvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCclpYa2dQU0JvWVhOb1pYSXVZWEJ3Ykhrb2JuVnNiQ3dnWVhKbmN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9hR0Z6TG1OaGJHd29iV1Z0Ynl3Z2EyVjVLU2tnZXlBZ0lGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHRnplVzVqTG5ObGRFbHRiV1ZrYVdGMFpTaG1kVzVqZEdsdmJpQW9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOckxtRndjR3g1S0c1MWJHd3NJRzFsYlc5YmEyVjVYU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUNBZ0lDQmxiSE5sSUdsbUlDaG9ZWE11WTJGc2JDaHhkV1YxWlhNc0lHdGxlU2twSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeGRXVjFaWE5iYTJWNVhTNXdkWE5vS0dOaGJHeGlZV05yS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lHVnNjMlVnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUhGMVpYVmxjMXRyWlhsZElEMGdXMk5oYkd4aVlXTnJYVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JtYmk1aGNIQnNlU2h1ZFd4c0xDQmhjbWR6TG1OdmJtTmhkQ2hiWDNKbGMzUlFZWEpoYlNobWRXNWpkR2x2YmlBb1lYSm5jeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQnRaVzF2VzJ0bGVWMGdQU0JoY21kek8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0IyWVhJZ2NTQTlJSEYxWlhWbGMxdHJaWGxkTzF4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQmtaV3hsZEdVZ2NYVmxkV1Z6VzJ0bGVWMDdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUdadmNpQW9kbUZ5SUdrZ1BTQXdMQ0JzSUQwZ2NTNXNaVzVuZEdnN0lHa2dQQ0JzT3lCcEt5c3BJSHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSEZiYVYwdVlYQndiSGtvYm5Wc2JDd2dZWEpuY3lrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSDFjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0I5S1YwcEtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJRzFsYlc5cGVtVmtMbTFsYlc4Z1BTQnRaVzF2TzF4dUlDQWdJQ0FnSUNCdFpXMXZhWHBsWkM1MWJtMWxiVzlwZW1Wa0lEMGdabTQ3WEc0Z0lDQWdJQ0FnSUhKbGRIVnliaUJ0WlcxdmFYcGxaRHRjYmlBZ0lDQjlPMXh1WEc0Z0lDQWdZWE41Ym1NdWRXNXRaVzF2YVhwbElEMGdablZ1WTNScGIyNGdLR1p1S1NCN1hHNGdJQ0FnSUNBZ0lISmxkSFZ5YmlCbWRXNWpkR2x2YmlBb0tTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNCeVpYUjFjbTRnS0dadUxuVnViV1Z0YjJsNlpXUWdmSHdnWm00cExtRndjR3g1S0c1MWJHd3NJR0Z5WjNWdFpXNTBjeWs3WEc0Z0lDQWdJQ0FnSUgwN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdaMWJtTjBhVzl1SUY5MGFXMWxjeWh0WVhCd1pYSXBJSHRjYmlBZ0lDQWdJQ0FnY21WMGRYSnVJR1oxYm1OMGFXOXVJQ2hqYjNWdWRDd2dhWFJsY21GMGIzSXNJR05oYkd4aVlXTnJLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnRZWEJ3WlhJb1gzSmhibWRsS0dOdmRXNTBLU3dnYVhSbGNtRjBiM0lzSUdOaGJHeGlZV05yS1R0Y2JpQWdJQ0FnSUNBZ2ZUdGNiaUFnSUNCOVhHNWNiaUFnSUNCaGMzbHVZeTUwYVcxbGN5QTlJRjkwYVcxbGN5aGhjM2x1WXk1dFlYQXBPMXh1SUNBZ0lHRnplVzVqTG5ScGJXVnpVMlZ5YVdWeklEMGdYM1JwYldWektHRnplVzVqTG0xaGNGTmxjbWxsY3lrN1hHNGdJQ0FnWVhONWJtTXVkR2x0WlhOTWFXMXBkQ0E5SUdaMWJtTjBhVzl1SUNoamIzVnVkQ3dnYkdsdGFYUXNJR2wwWlhKaGRHOXlMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWVhONWJtTXViV0Z3VEdsdGFYUW9YM0poYm1kbEtHTnZkVzUwS1N3Z2JHbHRhWFFzSUdsMFpYSmhkRzl5TENCallXeHNZbUZqYXlrN1hHNGdJQ0FnZlR0Y2JseHVJQ0FnSUdGemVXNWpMbk5sY1NBOUlHWjFibU4wYVc5dUlDZ3ZLaUJtZFc1amRHbHZibk11TGk0Z0tpOHBJSHRjYmlBZ0lDQWdJQ0FnZG1GeUlHWnVjeUE5SUdGeVozVnRaVzUwY3p0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUY5eVpYTjBVR0Z5WVcwb1puVnVZM1JwYjI0Z0tHRnlaM01wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCMGFHRjBJRDBnZEdocGN6dGNibHh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR05oYkd4aVlXTnJJRDBnWVhKbmMxdGhjbWR6TG14bGJtZDBhQ0F0SURGZE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tIUjVjR1Z2WmlCallXeHNZbUZqYXlBOVBTQW5ablZ1WTNScGIyNG5LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWVhKbmN5NXdiM0FvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJSDBnWld4elpTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMkZzYkdKaFkyc2dQU0J1YjI5d08xeHVJQ0FnSUNBZ0lDQWdJQ0FnZlZ4dVhHNGdJQ0FnSUNBZ0lDQWdJQ0JoYzNsdVl5NXlaV1IxWTJVb1ptNXpMQ0JoY21kekxDQm1kVzVqZEdsdmJpQW9ibVYzWVhKbmN5d2dabTRzSUdOaUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdabTR1WVhCd2JIa29kR2hoZEN3Z2JtVjNZWEpuY3k1amIyNWpZWFFvVzE5eVpYTjBVR0Z5WVcwb1puVnVZM1JwYjI0Z0tHVnljaXdnYm1WNGRHRnlaM01wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdZMklvWlhKeUxDQnVaWGgwWVhKbmN5azdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU2xkS1NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdablZ1WTNScGIyNGdLR1Z5Y2l3Z2NtVnpkV3gwY3lrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOckxtRndjR3g1S0hSb1lYUXNJRnRsY25KZExtTnZibU5oZENoeVpYTjFiSFJ6S1NrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ2ZUdGNibHh1SUNBZ0lHRnplVzVqTG1OdmJYQnZjMlVnUFNCbWRXNWpkR2x2YmlBb0x5b2dablZ1WTNScGIyNXpMaTR1SUNvdktTQjdYRzRnSUNBZ0lDQWdJSEpsZEhWeWJpQmhjM2x1WXk1elpYRXVZWEJ3Ykhrb2JuVnNiQ3dnUVhKeVlYa3VjSEp2ZEc5MGVYQmxMbkpsZG1WeWMyVXVZMkZzYkNoaGNtZDFiV1Z1ZEhNcEtUdGNiaUFnSUNCOU8xeHVYRzVjYmlBZ0lDQm1kVzVqZEdsdmJpQmZZWEJ3YkhsRllXTm9LR1ZoWTJobWJpa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdYM0psYzNSUVlYSmhiU2htZFc1amRHbHZiaWhtYm5Nc0lHRnlaM01wSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCbmJ5QTlJRjl5WlhOMFVHRnlZVzBvWm5WdVkzUnBiMjRvWVhKbmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJSFpoY2lCMGFHRjBJRDBnZEdocGN6dGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjJZWElnWTJGc2JHSmhZMnNnUFNCaGNtZHpMbkJ2Y0NncE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxkSFZ5YmlCbFlXTm9abTRvWm01ekxDQm1kVzVqZEdsdmJpQW9abTRzSUY4c0lHTmlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHWnVMbUZ3Y0d4NUtIUm9ZWFFzSUdGeVozTXVZMjl1WTJGMEtGdGpZbDBwS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCOUxGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHTmhiR3hpWVdOcktUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUNBZ0lDQWdJQ0FnYVdZZ0tHRnlaM011YkdWdVozUm9LU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR2R2TG1Gd2NHeDVLSFJvYVhNc0lHRnlaM01wTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ1pXeHpaU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR2R2TzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JoYzNsdVl5NWhjSEJzZVVWaFkyZ2dQU0JmWVhCd2JIbEZZV05vS0dGemVXNWpMbVZoWTJoUFppazdYRzRnSUNBZ1lYTjVibU11WVhCd2JIbEZZV05vVTJWeWFXVnpJRDBnWDJGd2NHeDVSV0ZqYUNoaGMzbHVZeTVsWVdOb1QyWlRaWEpwWlhNcE8xeHVYRzVjYmlBZ0lDQmhjM2x1WXk1bWIzSmxkbVZ5SUQwZ1puVnVZM1JwYjI0Z0tHWnVMQ0JqWVd4c1ltRmpheWtnZTF4dUlDQWdJQ0FnSUNCMllYSWdaRzl1WlNBOUlHOXViSGxmYjI1alpTaGpZV3hzWW1GamF5QjhmQ0J1YjI5d0tUdGNiaUFnSUNBZ0lDQWdkbUZ5SUhSaGMyc2dQU0JsYm5OMWNtVkJjM2x1WXlobWJpazdYRzRnSUNBZ0lDQWdJR1oxYm1OMGFXOXVJRzVsZUhRb1pYSnlLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQnBaaUFvWlhKeUtTQjdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdjbVYwZFhKdUlHUnZibVVvWlhKeUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ0lDQWdJSFJoYzJzb2JtVjRkQ2s3WEc0Z0lDQWdJQ0FnSUgxY2JpQWdJQ0FnSUNBZ2JtVjRkQ2dwTzF4dUlDQWdJSDA3WEc1Y2JpQWdJQ0JtZFc1amRHbHZiaUJsYm5OMWNtVkJjM2x1WXlobWJpa2dlMXh1SUNBZ0lDQWdJQ0J5WlhSMWNtNGdYM0psYzNSUVlYSmhiU2htZFc1amRHbHZiaUFvWVhKbmN5a2dlMXh1SUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR05oYkd4aVlXTnJJRDBnWVhKbmN5NXdiM0FvS1R0Y2JpQWdJQ0FnSUNBZ0lDQWdJR0Z5WjNNdWNIVnphQ2htZFc1amRHbHZiaUFvS1NCN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2RtRnlJR2x1Ym1WeVFYSm5jeUE5SUdGeVozVnRaVzUwY3p0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCcFppQW9jM2x1WXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JoYzNsdVl5NXpaWFJKYlcxbFpHbGhkR1VvWm5WdVkzUnBiMjRnS0NrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ1kyRnNiR0poWTJzdVlYQndiSGtvYm5Wc2JDd2dhVzV1WlhKQmNtZHpLVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnN1WVhCd2JIa29iblZzYkN3Z2FXNXVaWEpCY21kektUdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQjlYRzRnSUNBZ0lDQWdJQ0FnSUNCOUtUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQnplVzVqSUQwZ2RISjFaVHRjYmlBZ0lDQWdJQ0FnSUNBZ0lHWnVMbUZ3Y0d4NUtIUm9hWE1zSUdGeVozTXBPMXh1SUNBZ0lDQWdJQ0FnSUNBZ2MzbHVZeUE5SUdaaGJITmxPMXh1SUNBZ0lDQWdJQ0I5S1R0Y2JpQWdJQ0I5WEc1Y2JpQWdJQ0JoYzNsdVl5NWxibk4xY21WQmMzbHVZeUE5SUdWdWMzVnlaVUZ6ZVc1ak8xeHVYRzRnSUNBZ1lYTjVibU11WTI5dWMzUmhiblFnUFNCZmNtVnpkRkJoY21GdEtHWjFibU4wYVc5dUtIWmhiSFZsY3lrZ2UxeHVJQ0FnSUNBZ0lDQjJZWElnWVhKbmN5QTlJRnR1ZFd4c1hTNWpiMjVqWVhRb2RtRnNkV1Z6S1R0Y2JpQWdJQ0FnSUNBZ2NtVjBkWEp1SUdaMWJtTjBhVzl1SUNoallXeHNZbUZqYXlrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR05oYkd4aVlXTnJMbUZ3Y0d4NUtIUm9hWE1zSUdGeVozTXBPMXh1SUNBZ0lDQWdJQ0I5TzF4dUlDQWdJSDBwTzF4dVhHNGdJQ0FnWVhONWJtTXVkM0poY0ZONWJtTWdQVnh1SUNBZ0lHRnplVzVqTG1GemVXNWphV1o1SUQwZ1puVnVZM1JwYjI0Z1lYTjVibU5wWm5rb1puVnVZeWtnZTF4dUlDQWdJQ0FnSUNCeVpYUjFjbTRnWDNKbGMzUlFZWEpoYlNobWRXNWpkR2x2YmlBb1lYSm5jeWtnZTF4dUlDQWdJQ0FnSUNBZ0lDQWdkbUZ5SUdOaGJHeGlZV05ySUQwZ1lYSm5jeTV3YjNBb0tUdGNiaUFnSUNBZ0lDQWdJQ0FnSUhaaGNpQnlaWE4xYkhRN1hHNGdJQ0FnSUNBZ0lDQWdJQ0IwY25rZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lISmxjM1ZzZENBOUlHWjFibU11WVhCd2JIa29kR2hwY3l3Z1lYSm5jeWs3WEc0Z0lDQWdJQ0FnSUNBZ0lDQjlJR05oZEdOb0lDaGxLU0I3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnY21WMGRYSnVJR05oYkd4aVlXTnJLR1VwTzF4dUlDQWdJQ0FnSUNBZ0lDQWdmVnh1SUNBZ0lDQWdJQ0FnSUNBZ0x5OGdhV1lnY21WemRXeDBJR2x6SUZCeWIyMXBjMlVnYjJKcVpXTjBYRzRnSUNBZ0lDQWdJQ0FnSUNCcFppQW9YMmx6VDJKcVpXTjBLSEpsYzNWc2RDa2dKaVlnZEhsd1pXOW1JSEpsYzNWc2RDNTBhR1Z1SUQwOVBTQmNJbVoxYm1OMGFXOXVYQ0lwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNCeVpYTjFiSFF1ZEdobGJpaG1kVzVqZEdsdmJpaDJZV3gxWlNrZ2UxeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0JqWVd4c1ltRmpheWh1ZFd4c0xDQjJZV3gxWlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ2ZTbGJYQ0pqWVhSamFGd2lYU2htZFc1amRHbHZiaWhsY25JcElIdGNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnWTJGc2JHSmhZMnNvWlhKeUxtMWxjM05oWjJVZ1B5QmxjbklnT2lCdVpYY2dSWEp5YjNJb1pYSnlLU2s3WEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnZlNrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5SUdWc2MyVWdlMXh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJR05oYkd4aVlXTnJLRzUxYkd3c0lISmxjM1ZzZENrN1hHNGdJQ0FnSUNBZ0lDQWdJQ0I5WEc0Z0lDQWdJQ0FnSUgwcE8xeHVJQ0FnSUgwN1hHNWNiaUFnSUNBdkx5Qk9iMlJsTG1welhHNGdJQ0FnYVdZZ0tIUjVjR1Z2WmlCdGIyUjFiR1VnUFQwOUlDZHZZbXBsWTNRbklDWW1JRzF2WkhWc1pTNWxlSEJ2Y25SektTQjdYRzRnSUNBZ0lDQWdJRzF2WkhWc1pTNWxlSEJ2Y25SeklEMGdZWE41Ym1NN1hHNGdJQ0FnZlZ4dUlDQWdJQzh2SUVGTlJDQXZJRkpsY1hWcGNtVktVMXh1SUNBZ0lHVnNjMlVnYVdZZ0tIUjVjR1Z2WmlCa1pXWnBibVVnUFQwOUlDZG1kVzVqZEdsdmJpY2dKaVlnWkdWbWFXNWxMbUZ0WkNrZ2UxeHVJQ0FnSUNBZ0lDQmtaV1pwYm1Vb1cxMHNJR1oxYm1OMGFXOXVJQ2dwSUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSEpsZEhWeWJpQmhjM2x1WXp0Y2JpQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ2ZWeHVJQ0FnSUM4dklHbHVZMngxWkdWa0lHUnBjbVZqZEd4NUlIWnBZU0E4YzJOeWFYQjBQaUIwWVdkY2JpQWdJQ0JsYkhObElIdGNiaUFnSUNBZ0lDQWdjbTl2ZEM1aGMzbHVZeUE5SUdGemVXNWpPMXh1SUNBZ0lIMWNibHh1ZlNncEtUdGNiaUpkZlE9PSIsIid1c2Ugc3RyaWN0JztcblxudmFyIHNob3J0ID0gW1snMS4xJywgJ2dyYWluIGJhc2VkIGJha2VkJ10sIFsnMS4yJywgJ2dyYWluIGZyZWUgYmFrZWQnXSwgWycyLjEuMScsICdiZWVyJ10sIFsnMi4xLjInLCAnZGlzdGlsbGVkJ10sIFsnMi4xLjMnLCAnbGlxdW9yJ10sIFsnMi4xLjQnLCAnd2luZSddLCBbJzInLCAnY2VyZWFsIGdyYWlucyBhbmQgcGFzdGEnXSwgWyc0LjEnLCAnZGFpcnknXSwgWyc0LjInLCAnZWdnJ10sIFsnNScsICdmYXRzIGFuZCBvaWxzJ10sIFsnNicsICdmaXNoIGFuZCBzaGVsbGZpc2gnXSwgWyc3JywgJ2ZydWl0IGFuZCBqdWljZXMnXSwgWyc4JywgJ2xlZ3VtZXMnXSwgWyc5LjEnLCAnYmVlZiddLCBbJzkuMicsICdwb3JrJ10sIFsnOS4zLjEnLCAnY2hpY2tlbiddLCBbJzkuMy4yJywgJ3R1cmtleSddLCBbJzkuMy4zJywgJ2R1Y2snXSwgWyc5LjMuNCcsICdnb29zZSddLCBbJzkuNCcsICdsYW1iJ10sIFsnOS41JywgJ2dhbWUnXSwgWycxMCcsICdudXRzIGFuZCBzZWVkcyddLCBbJzExJywgJ3NwaWNlcyBhbmQgaGVyYnMnXSwgWycxMicsICd2ZWdldGFibGVzJ11dO1xuXG52YXIgY2F0ZWdvcmllcyA9IHtcbiAgICAxOiB7XG4gICAgICAgIG5hbWU6ICdiYWtlZCBwcm9kdWN0cycsXG4gICAgICAgIHN1Yjoge1xuICAgICAgICAgICAgMToge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdncmFpbiBiYXNlZCBiYWtlZCBwcm9kdWN0cycsXG4gICAgICAgICAgICAgICAgcGFsZW86IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMjoge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdncmFpbiBmcmVlIGJha2VkIHByb2R1Y3RzJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAyOiB7XG4gICAgICAgIG5hbWU6ICdiZXZlcmFnZXMnLFxuICAgICAgICBzdWI6IHtcbiAgICAgICAgICAgIDE6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnYWxjb2hvbGljJyxcbiAgICAgICAgICAgICAgICBwYWxlbzogZmFsc2UsXG4gICAgICAgICAgICAgICAgc3ViOiB7XG4gICAgICAgICAgICAgICAgICAgIDE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdiZWVyJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZGlzdGlsbGVkJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnbGlxdW9yJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICA0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnd2luZSdcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAyOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2NvZmZlZSdcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAzOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3RlYSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgMzoge1xuICAgICAgICBuYW1lOiAnY2VyZWFsIGdyYWlucyBhbmQgcGFzdGEnLFxuICAgICAgICBwYWxlbzogZmFsc2VcbiAgICB9LFxuICAgIDQ6IHtcbiAgICAgICAgbmFtZTogJ2RhaXJ5IGFuZCBlZ2cnLFxuICAgICAgICBzdWI6IHtcbiAgICAgICAgICAgIDE6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnZGFpcnknLFxuICAgICAgICAgICAgICAgIHBhbGVvOiBmYWxzZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDI6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnZWdnJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICA1OiB7XG4gICAgICAgIG5hbWU6ICdmYXRzIGFuZCBvaWxzJ1xuICAgIH0sXG4gICAgNjoge1xuICAgICAgICBuYW1lOiAnZmlzaCBhbmQgc2hlbGxmaXNoJ1xuICAgIH0sXG4gICAgNzoge1xuICAgICAgICBuYW1lOiAnZnJ1aXRzIGFuZCBqdWljZXMnXG4gICAgfSxcbiAgICA4OiB7XG4gICAgICAgIG5hbWU6ICdsZWd1bWVzJyxcbiAgICAgICAgcGFsZW86IGZhbHNlXG4gICAgfSxcbiAgICA5OiB7XG4gICAgICAgIG5hbWU6ICdtZWF0JyxcbiAgICAgICAgc3ViOiB7XG4gICAgICAgICAgICAxOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2JlZWYnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMjoge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdwb3JrJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDM6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAncG91bHRyeScsXG4gICAgICAgICAgICAgICAgc3ViOiB7XG4gICAgICAgICAgICAgICAgICAgIDE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdjaGlja2VuJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAyOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAndHVya2V5J1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZHVjaydcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgNDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2dvb3NlJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDQ6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnbGFtYidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICA1OiB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2dhbWUnXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIDEwOiB7XG4gICAgICAgIG5hbWU6ICdudXRzIGFuZCBzZWVkcydcbiAgICB9LFxuICAgIDExOiB7XG4gICAgICAgIG5hbWU6ICdzcGljZXMgYW5kIGhlcmJzJ1xuICAgIH0sXG4gICAgMTI6IHtcbiAgICAgICAgbmFtZTogJ3ZlZ2V0YWJsZXMnXG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgY2F0ZWdvcmllczogY2F0ZWdvcmllcyxcbiAgICBzaG9ydDogc2hvcnRcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3MgPSB7XG5cdGxvZzogZnVuY3Rpb24gbG9nKHRleHQpIHtcblx0XHRjb25zb2xlLmxvZyh0ZXh0KTtcblx0fSxcblx0Z2V0OiBmdW5jdGlvbiBnZXQodXJsLCBjYWxsYmFjaykge1xuXHRcdHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuXHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcblx0XHRcdFx0aWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuXHRcdFx0XHRcdHZhciByZXNwb25zZSA9IHhoci5yZXNwb25zZSA/IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKSA6IG51bGw7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cywgcmVzcG9uc2UpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHhoci5zdGF0dXMgPCA1MDApIHtcblx0XHRcdFx0XHRjYWxsYmFjayh4aHIuc3RhdHVzKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCdhamF4IGdldCBlcnJvcicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR4aHIub3BlbignR0VUJywgdXJsKTtcblx0XHR4aHIuc2VuZCgpO1xuXHR9LFxuXHRwb3N0OiBmdW5jdGlvbiBwb3N0KHVybCwgZGF0YSwgY2FsbGJhY2spIHtcblx0XHR2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cblx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlID09PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG5cdFx0XHRcdGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcblx0XHRcdFx0XHR2YXIgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2UgPyBKU09OLnBhcnNlKHhoci5yZXNwb25zZSkgOiBudWxsO1xuXHRcdFx0XHRcdGNhbGxiYWNrKHhoci5zdGF0dXMsIHJlc3BvbnNlKTtcblx0XHRcdFx0fSBlbHNlIGlmICh4aHIuc3RhdHVzIDwgNTAwKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignYWpheCBwb3N0IGVycm9yJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdHhoci5vcGVuKCdQT1NUJywgdXJsKTtcblx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblx0XHR4aHIuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cdH0sXG5cdGNvb2tpZTogZnVuY3Rpb24gY29va2llKG5hbWUsIGNvb2tpZXMpIHtcblx0XHR2YXIgYyA9IHRoaXMuY29va2llcyhjb29raWVzKTtcblx0XHRyZXR1cm4gY1tuYW1lXTtcblx0fSxcblx0Y29va2llczogZnVuY3Rpb24gY29va2llcyhfY29va2llcykge1xuXHRcdHZhciBuYW1lVmFsdWVzID0gX2Nvb2tpZXMuc3BsaXQoJzsgJyk7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdG5hbWVWYWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIGkgPSBpdGVtLnNwbGl0KCc9Jyk7XG5cdFx0XHRyZXN1bHRbaVswXV0gPSBpWzFdO1xuXHRcdH0pO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdGdldFF1ZXJ5VmFsdWU6IGZ1bmN0aW9uIGdldFF1ZXJ5VmFsdWUocXVlcnlTdHJpbmcsIG5hbWUpIHtcblx0XHR2YXIgYXJyID0gcXVlcnlTdHJpbmcubWF0Y2gobmV3IFJlZ0V4cChuYW1lICsgJz0oW14mXSspJykpO1xuXG5cdFx0aWYgKGFycikge1xuXHRcdFx0cmV0dXJuIGFyclsxXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgdGVzdHMgPSBbe1xuXHRpZDogMSxcblx0dGVzdDogZnVuY3Rpb24gdGVzdCgpIHtcblx0XHR2YXIgY29va2llcyA9IHtcblx0XHRcdGNzYXRpOiAnbWFqb20nLFxuXHRcdFx0b25lOiAndHdvJ1xuXHRcdH07XG5cblx0XHR2YXIgcmVzdWx0ID0gdHJ1ZTtcblxuXHRcdHZhciBjID0gY3MuY29va2llcygnY3NhdGk9bWFqb207IG9uZT10d28nKTtcblxuXHRcdGlmIChjLmNzYXRpICE9PSBjb29raWVzLmNzYXRpKSByZXN1bHQgPSBmYWxzZTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cbn0sIHtcblx0aWQ6IDIsXG5cdHRlc3Q6IGZ1bmN0aW9uIHRlc3QoKSB7XG5cdFx0cmV0dXJuICdiYXInID09PSBjcy5jb29raWUoJ2ZvbycsICdmb289YmFyOyB0ZT1tYWpvbScpO1xuXHR9XG59LCB7XG5cdGlkOiAzLFxuXHR0ZXN0OiBmdW5jdGlvbiB0ZXN0KCkge1xuXHRcdHJldHVybiAnMTIzJyA9PT0gY3MuZ2V0UXVlcnlWYWx1ZSgnP2NzYXRpPW1ham9tJnVzZXJfaWQ9MTIzJnZhbGFtaT1zZW1taScsICd1c2VyX2lkJyk7XG5cdH1cbn1dO1xuXG5pZiAoZmFsc2UpIHtcblx0dmFyIHJlc3VsdCA9IHRydWU7XG5cdHRlc3RzLmZvckVhY2goZnVuY3Rpb24gKHRlc3QpIHtcblx0XHRpZiAoIXRlc3QudGVzdCgpKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKHRlc3QuaWQgKyAnLiB0ZXN0IGZhaWxlZCcpO1xuXHRcdFx0cmVzdWx0ID0gZmFsc2U7XG5cdFx0fVxuXHR9KTtcblx0aWYgKHJlc3VsdCkge1xuXHRcdGNvbnNvbGUubG9nKCdBbGwgdGVzdHMgc3VjY2VlZGVkIScpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3M7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbnV0cmllbnRzID0ge1xuXHQnZW5lcmd5JzogJzIwOCcsXG5cdCdwcm90ZWluJzogJzIwMycsXG5cdCdmYXQnOiAnMjA0Jyxcblx0J2NhcmJvaHlkcmF0ZSc6ICcyMDUnLFxuXHQnZmliZXInOiAnMjkxJyxcblx0J3N1Z2FyJzogJzI2OScsXG5cdCdDYSc6ICczMDEnLFxuXHQnRmUnOiAnMzAzJyxcblx0J01nJzogJzMwNCcsXG5cdCdQJzogJzMwNScsXG5cdCdLJzogJzMwNicsXG5cdCdOYSc6ICczMDcnLFxuXHQnWm4nOiAnMzA5Jyxcblx0J0N1JzogJzMxMicsXG5cdCdNbic6ICczMTUnLFxuXHQnU2UnOiAnMzE3Jyxcblx0J0YnOiAnMzEzJyxcblx0J3ZfYSc6ICczMTgnLFxuXHQndl9iNic6ICc0MTUnLFxuXHQndl9iMTInOiAnNDE4Jyxcblx0J3ZfYyc6ICc0MDEnLFxuXHQndl9kMyc6ICczMjYnLFxuXHQndl9lJzogJzMyMycsXG5cdCd2X2snOiAnNDMwJyxcblx0J2ZhdHR5X2FjaWRzX3RvdGFsX3NhdHVyYXRlZCc6ICc2MDYnLFxuXHQnZmF0dHlfYWNpZHNfdG90YWxfbW9ub3Vuc2F0dXJhdGVkJzogJzY0NScsXG5cdCdmYXR0eV9hY2lkc190b3RhbF9wb2x5dW5zYXR1cmF0ZWQnOiAnNjQ2Jyxcblx0J2ZhdHR5X2FjaWRzX3RvdGFsX3RyYW5zJzogJzYwNScsXG5cdCdEUEEnOiAnNjMxJyxcblx0J0RIQSc6ICc2MjEnLFxuXHQnY2hvbGVzdGVyb2wnOiAnNjAxJyxcblx0J2FsY29ob2xfZXRoeWwnOiAnMjIxJyxcblx0J2NhZmZlaW5lJzogJzI2Midcbn07XG5cbnZhciBmb29kR3JvdXBzID0ge1xuXHQnZWdnJzogJzEnLFxuXHQnc3BpY2VzX2FuZF9oZXJicyc6ICcyJyxcblx0J2JhYnlfZm9vZHMnOiAnMycsXG5cdCdmYXRzX2FuZF9vaWxzJzogJzQnLFxuXHQncG91bHRyeSc6ICc1Jyxcblx0J3NvdXBzX3NhdWNlc19hbmRfZ3Jhdmllcyc6ICc2Jyxcblx0J3NhdXNhZ2VzX2FuZF9sdW5jaGVvbl9tZWF0cyc6ICc3Jyxcblx0J2JyZWFrZmFzdF9jZXJlYWxzJzogJzgnLFxuXHQnZnJ1aXRzX2FuZF9mcnVpdF9qdWljZXMnOiAnOScsXG5cdCdwb3JrJzogJzEwJyxcblx0J3ZlZ2V0YWJsZXMnOiAnMTEnLFxuXHQnbnV0c19hbmRfc2VlZHMnOiAnMTInLFxuXHQnYmVlZic6ICcxMycsXG5cdCdiZXZlcmFnZXMnOiAnMTQnLFxuXHQnZmlzaF9hbmRfc2hlbGxmaXNoJzogJzE1Jyxcblx0J2xlZ3VtZXMnOiAnMTYnLFxuXHQnbGFtYl92ZWFsX2FuZF9nYW1lJzogJzE3Jyxcblx0J2Jha2VkX3Byb2R1Y3RzJzogJzE4Jyxcblx0J3N3ZWV0cyc6ICcxOScsXG5cdCdjZXJlYWxfZ3JhaW5zX2FuZF9wYXN0YSc6ICcyMCcsXG5cdCdmYXN0X2Zvb2RzJzogJzIxJyxcblx0J21lYWxzX2VudHJlZXNfYW5kX3NpZGVfZGlzaGVzJzogJzIyJ1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG51dHJpZW50czogbnV0cmllbnRzLFxuXHRmb29kR3JvdXBzOiBmb29kR3JvdXBzLFxuXHRhcGlLZXk6ICdQWXphNmo1VzZNMkNxODYzc3ZKeGl6MXA4cVYycW9HQ2dHZjBTeUg0J1xufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBmb29kID0ge1xuXHRjbGllbnQ6IHtcblx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRpZDogeyB0eXBlOiAnaW50ZWdlcicgfSxcblx0XHRcdG5hbWU6IHsgdHlwZTogJ3N0cmluZycsIG1pbkxlbmd0aDogMyB9LFxuXHRcdFx0ZGVzY3JpcHRpb246IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdGNhdGVnb3J5OiB7IHR5cGU6ICdzdHJpbmcnLCBtaW5MZW5ndGg6IDEgfSxcblx0XHRcdHBhbGVvOiB7IHR5cGU6ICdpbnRlZ2VyJywgZXE6IFsxLCA1LCAxMF0gfSxcblx0XHRcdGtldG86IHsgdHlwZTogJ2ludGVnZXInLCBlcTogWzEsIDUsIDEwXSB9LFxuXHRcdFx0ZW5hYmxlZDogeyB0eXBlOiAnYm9vbGVhbicgfVxuXHRcdH1cblx0fVxufTtcblxudmFyIHdpc2ggPSB7XG5cdGJsYW5rOiBmdW5jdGlvbiBibGFuayh1c2VyKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHVzZXI6IHVzZXIsXG5cdFx0XHR0aXRsZTogJycsXG5cdFx0XHRkZXNjcmlwdGlvbjogJycsXG5cdFx0XHRkaXJ0eTogdHJ1ZVxuXHRcdH07XG5cdH0sXG5cdGNsaWVudDoge1xuXHRcdHR5cGU6ICdvYmplY3QnLFxuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdGlkOiB7IHR5cGU6IFsnc3RyaW5nJywgJ251bGwnXSwgb3B0aW9uYWw6IHRydWUgfSxcblx0XHRcdHRpdGxlOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG5cdFx0XHRkZXNjcmlwdGlvbjogeyB0eXBlOiAnc3RyaW5nJyB9LFxuXHRcdFx0dXNlcjoge1xuXHRcdFx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRcdFx0cHJvcGVydGllczoge1xuXHRcdFx0XHRcdGlkOiB7IHRweWU6ICdzdHJpbmcnIH0sXG5cdFx0XHRcdFx0bmFtZTogeyB0eXBlOiAnc3RyaW5nJyB9XG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRkaXJ0eTogeyB0eXBlOiAnYm9vbGVhbicgfVxuXHRcdH1cblx0fSxcblx0c2VydmVyOiB7XG5cdFx0dHlwZTogJ29iamVjdCcsXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0aWQ6IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdHRpdGxlOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG5cdFx0XHRkZXNjcmlwdGlvbjogeyB0eXBlOiAnc3RyaW5nJyB9LFxuXHRcdFx0dXNlcjoge1xuXHRcdFx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRcdFx0cHJvcGVydGllczoge1xuXHRcdFx0XHRcdGlkOiB7IHRweWU6ICdzdHJpbmcnIH0sXG5cdFx0XHRcdFx0bmFtZTogeyB0eXBlOiAnc3RyaW5nJyB9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGNsaWVudFRvU2VydmVyOiBmdW5jdGlvbiBjbGllbnRUb1NlcnZlcihvYmopIHtcblx0XHR2YXIgd2lzaCA9IHtcblx0XHRcdHVzZXI6IG9iai51c2VyLFxuXHRcdFx0ZGVzY3JpcHRpb246IG9iai5kZXNjcmlwdGlvbixcblx0XHRcdHRpdGxlOiBvYmoudGl0bGVcblx0XHR9O1xuXHRcdGlmIChvYmouaWQpIHdpc2guaWQgPSBvYmouaWQ7XG5cdFx0cmV0dXJuIHdpc2g7XG5cdH0sXG5cdHNlcnZlclRvQ2xpZW50OiBmdW5jdGlvbiBzZXJ2ZXJUb0NsaWVudChvYmopIHtcblx0XHRvYmouZGlydHkgPSBmYWxzZTtcblx0XHRyZXR1cm4gXy5jbG9uZShvYmopO1xuXHR9XG59O1xuXG52YXIgd2lzaExpc3QgPSB7XG5cdHNlcnZlcjoge1xuXHRcdHR5cGU6ICdhcnJheScsXG5cdFx0aXRlbXM6IHtcblx0XHRcdHR5cGU6ICdvYmplY3QnLFxuXHRcdFx0cHJvcGVydGllczogd2lzaC5zZXJ2ZXIucHJvcGVydGllc1xuXHRcdH1cblx0fVxufTtcblxudmFyIHVzZXIgPSB7XG5cdGJsYW5rOiBmdW5jdGlvbiBibGFuaygpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aWQ6IG51bGwsXG5cdFx0XHRuYW1lOiAnJyxcblx0XHRcdHN0YXR1czogYmVsbGEuY29uc3RhbnRzLnVzZXJTdGF0dXMuR1VFU1Rcblx0XHR9O1xuXHR9LFxuXHRjbGllbnQ6IHtcblx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRpZDogeyB0eXBlOiBbJ3N0cmluZycsICdudWxsJ10sIG9wdGlvbmFsOiB0cnVlIH0sXG5cdFx0XHRuYW1lOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG5cdFx0XHRzdGF0dXM6IHsgdHlwZTogJ3N0cmluZycsIGVxOiBfLnZhbHVlcyhiZWxsYS5jb25zdGFudHMudXNlclN0YXR1cykgfVxuXHRcdH1cblx0fSxcblx0c2VydmVyOiB7XG5cdFx0dHlwZTogJ29iamVjdCcsXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0aWQ6IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdG5hbWU6IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdHN0YXR1czogeyB0eXBlOiAnc3RyaW5nJywgZXE6IF8udmFsdWVzKGJlbGxhLmNvbnN0YW50cy51c2VyU3RhdHVzKSB9XG5cdFx0fVxuXHR9LFxuXHRjbGllbnRUb1NlcnZlcjogZnVuY3Rpb24gY2xpZW50VG9TZXJ2ZXIob2JqKSB7fSxcblx0c2VydmVyVG9DbGllbnQ6IGZ1bmN0aW9uIHNlcnZlclRvQ2xpZW50KG9iaikge31cbn07XG5cbm1vZHVsZS5leHBvcnRzID0ge1xuXHR3aXNoOiB3aXNoLFxuXHR3aXNoTGlzdDogd2lzaExpc3QsXG5cdHVzZXI6IHVzZXIsXG5cdGZvb2Q6IGZvb2Rcbn07IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3MgPSByZXF1aXJlKCcuL2hlbHBlcnMvY3MnKTtcbnZhciBpbnNwZWN0b3IgPSByZXF1aXJlKCdzY2hlbWEtaW5zcGVjdG9yJyk7XG52YXIgc2NoZW1hcyA9IHJlcXVpcmUoJy4vc2NoZW1hcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0d2lzaDoge1xuXHRcdGdldDogZnVuY3Rpb24gZ2V0KGlkLCBjYWxsYmFjaykge1xuXHRcdFx0Y3MuZ2V0KCcvd2lzaD9pZD0nICsgaWQsIGZ1bmN0aW9uIChzdGF0dXMsIHdpc2gpIHtcblx0XHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSB7XG5cdFx0XHRcdFx0dmFyIHZhbGlkYXRpb24gPSBpbnNwZWN0b3IudmFsaWRhdGUoc2NoZW1hcy53aXNoLnNlcnZlciwgd2lzaCk7XG5cdFx0XHRcdFx0aWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCd3aXNoIHZhbGlkYXRpb24gZXJyb3InLCB2YWxpZGF0aW9uLmZvcm1hdCgpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiB0cnVlIH0sIHNjaGVtYXMud2lzaC5zZXJ2ZXJUb0NsaWVudCh3aXNoKSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuTk9UX0ZPVU5EKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogJ1dpc2ggbm90IGZvdW5kJyB9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRwb3N0OiBmdW5jdGlvbiBwb3N0KHdpc2gsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgdmFsaWRhdGlvbiA9IGluc3BlY3Rvci52YWxpZGF0ZShzY2hlbWFzLndpc2guY2xpZW50LCB3aXNoKTtcblx0XHRcdGlmICh2YWxpZGF0aW9uLnZhbGlkKSB7XG5cdFx0XHRcdGNzLnBvc3QoJy93aXNoJywgc2NoZW1hcy53aXNoLmNsaWVudFRvU2VydmVyKHdpc2gpLCBmdW5jdGlvbiAoc3RhdHVzKSB7XG5cdFx0XHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSBjYWxsYmFjayh7IHN1Y2Nlc3M6IHRydWUgfSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0d2lzaExpc3Q6IHtcblx0XHRnZXQ6IGZ1bmN0aW9uIGdldChjYWxsYmFjaykge1xuXHRcdFx0Y3MuZ2V0KCcvd2lzaExpc3QnLCBmdW5jdGlvbiAoc3RhdHVzLCB3aXNoTGlzdCkge1xuXHRcdFx0XHRpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuT0spIHtcblx0XHRcdFx0XHR2YXIgdmFsaWRhdGlvbiA9IGluc3BlY3Rvci52YWxpZGF0ZShzY2hlbWFzLndpc2hMaXN0LnNlcnZlciwgd2lzaExpc3QpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCd2YWlsZGF0aW9uJywgdmFsaWRhdGlvbik7XG5cdFx0XHRcdFx0aWYgKCF2YWxpZGF0aW9uLnZhbGlkKSBjb25zb2xlLmVycm9yKCd3aXNoTGlzdCBzZXJ2ZXIgdmFsaWRhdGlvbiBlcnJvcicpO1xuXHRcdFx0XHRcdGNhbGxiYWNrKHsgc3VjY2VzczogdHJ1ZSB9LCB3aXNoTGlzdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignd2lzaExpc3QgYWpheCBlcnJvcicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdHVzZXJTdGF0dXM6IHtcblx0XHRnZXQ6IGZ1bmN0aW9uIGdldChjYWxsYmFjaykge1xuXHRcdFx0Y3MuZ2V0KCcvdXNlclN0YXR1cycsIGZ1bmN0aW9uIChzdGF0dXMsIHVzZXJTdGF0dXMpIHtcblx0XHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiB0cnVlIH0sIHVzZXJTdGF0dXMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdGxvZ2luOiBmdW5jdGlvbiBsb2dpbihsb2dpbkRhdGEsIGNhbGxiYWNrKSB7XG5cdFx0Y3MucG9zdCgnL2xvZ2luJywgbG9naW5EYXRhLCBmdW5jdGlvbiAoc3RhdHVzLCB1c2VyKSB7XG5cdFx0XHRpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuT0spIHtcblx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiB0cnVlIH0sIHVzZXIpO1xuXHRcdFx0fSBlbHNlIGlmIChzdGF0dXMgPT09IGJlbGxhLmNvbnN0YW50cy5yZXNwb25zZS5OT1RfRk9VTkQpIHtcblx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiBmYWxzZSB9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0bG9nb3V0OiBmdW5jdGlvbiBsb2dvdXQoY2FsbGJhY2spIHtcblx0XHRjcy5nZXQoJ2xvZ291dCcsIGZ1bmN0aW9uIChzdGF0dXMpIHtcblx0XHRcdGlmIChzdGF0dXMgPT09IGJlbGxhLmNvbnN0YW50cy5yZXNwb25zZS5PSykge1xuXHRcdFx0XHRjYWxsYmFjayh7IHN1Y2Nlc3M6IHRydWUgfSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGZvb2Q6IHtcblx0XHRnZXQ6IGZ1bmN0aW9uIGdldChjYXRlZ29yeUlkLCBjYWxsYmFjaykge1xuXHRcdFx0Y3MuZ2V0KCcvZm9vZHMvJyArIGNhdGVnb3J5SWQsIGZ1bmN0aW9uIChzdGF0dXMsIGZvb2RzKSB7fSk7XG5cdFx0fSxcblx0XHRwb3N0OiBmdW5jdGlvbiBwb3N0KGZvb2QsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgdmFsaWRhdGlvbiA9IGluc3BlY3Rvci52YWxpZGF0ZShzY2hlbWFzLmZvb2QuY2xpZW50LCBmb29kKTtcblxuXHRcdFx0aWYgKHZhbGlkYXRpb24udmFsaWQpIHtcblx0XHRcdFx0Y3MucG9zdCgnL2Zvb2QnLCBmb29kLCBmdW5jdGlvbiAoc3RhdHVzKSB7XG5cdFx0XHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSB7XG5cdFx0XHRcdFx0XHRjYWxsYmFjayh0cnVlLCBudWxsKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y2FsbGJhY2soZmFsc2UsIFt7IHByb3BlcnR5OiAnc2VydmVyJywgbWVzc2FnZTogJ2Vycm9yJyB9XSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNhbGxiYWNrKHZhbGlkYXRpb24udmFsaWQsIHZhbGlkYXRpb24uZXJyb3IpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTsiXX0=
