(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var cs = require('../helpers/cs');
var factory = require('../factory');
var statuses = {
	INIT: 'INIT',
	READY: 'READY',
	SAVING: 'SAVING',
	NOT_FOUND: 'NOT_FOUND',
	ERROR: 'ERROR'
};
var update = require('react-addons-update');
var server = require('../server');
var schemas = require('../schemas');

var QuestPage = React.createClass({
	displayName: 'QuestPage',

	getInitialState: function getInitialState() {
		return {
			status: statuses.INIT,
			quest: {},
			loggedIn: bella.data.user.get().status === bella.constants.userStatus.LOGGED_IN
		};
	},
	componentDidMount: function componentDidMount() {
		var _this = this;

		var wishId = cs.getQueryValue(document.location.search, 'quest_id');

		bella.data.user.subscribe(function (user) {
			_this.setState({ loggedIn: user.status === bella.constants.userStatus.LOGGED_IN });
		});

		if (wishId) {
			server.wish.get(wishId, function (result, wish) {
				if (result.success) {
					_this.setState({
						quest: wish,
						status: statuses.READY
					});
				} else {
					console.log(result.message);
					_this.setState({
						status: statuses.NOT_FOUND
					});
				}
			});
		} else {
			this.setState({
				quest: schemas.wish.blank(bella.data.user.get()),
				status: statuses.READY
			});
		}
	},
	render: function render() {
		var page;

		if (this.state.status === statuses.INIT) {
			page = React.createElement(
				'div',
				null,
				'init'
			);
		} else if (this.state.status === statuses.NOT_FOUND) {
			page = React.createElement(
				'div',
				null,
				'not found'
			);
		} else if (this.state.status === statuses.ERROR) {
			page = React.createElement(
				'div',
				null,
				'error'
			);
		} else if (this.state.status === statuses.SAVING) {
			page = React.createElement(
				'div',
				null,
				'saving'
			);
		} else if (this.state.status === statuses.READY) {
			page = React.createElement(
				'div',
				{ className: 'bc-quest-page' },
				React.createElement(
					'h1',
					null,
					'Quest'
				),
				React.createElement(RCQuest, {
					quest: this.state.quest,
					own: this.state.quest.user && this.state.quest.user.id === cs.cookie('user_id', document.cookie),
					loggedIn: this.state.loggedIn,
					save: this.save })
			);
		}

		return page;
	},
	save: function save(title, description) {
		var _this2 = this;

		this.setState({ status: statuses.SAVING });
		server.wish.post(update(this.state.quest, { title: { $set: title }, description: { $set: description } }), function (result) {
			if (result.success) {
				_this2.setState({
					status: statuses.SAVING
				});
				window.location.href = '/quest_list.html';
			}
		});
	}
});

var RCQuest = React.createClass({
	displayName: 'RCQuest',

	getInitialState: function getInitialState() {
		return { edit: !this.props.quest.id };
	},
	render: function render() {
		var toggleEditButton = this.props.own && this.props.loggedIn ? React.createElement(
			'button',
			{ onClick: this.toggleEdit },
			this.state.edit ? 'Cancel' : 'Edit'
		) : null;
		var saveButton = this.props.quest.dirty || this.state.edit ? React.createElement(
			'button',
			{ onClick: this.save },
			'Save'
		) : null;
		var title = this.state.edit ? React.createElement('input', { type: 'text', defaultValue: this.props.quest.title, ref: 'title' }) : React.createElement(
			'span',
			null,
			this.props.quest.title
		);
		var description = this.state.edit ? React.createElement('textarea', { cols: '30', rows: '10', defaultValue: this.props.quest.description, ref: 'description' }) : React.createElement(
			'span',
			null,
			this.props.quest.description
		);
		var user = this.props.quest.user ? React.createElement(
			'tr',
			null,
			React.createElement(
				'td',
				null,
				'user:'
			),
			React.createElement(
				'td',
				null,
				this.props.quest.user.name
			)
		) : null;

		return React.createElement(
			'div',
			null,
			React.createElement(
				'table',
				null,
				React.createElement(
					'tbody',
					null,
					user,
					React.createElement(
						'tr',
						null,
						React.createElement(
							'td',
							null,
							'title:'
						),
						React.createElement(
							'td',
							null,
							title
						)
					),
					React.createElement(
						'tr',
						null,
						React.createElement(
							'td',
							null,
							'description:'
						),
						React.createElement(
							'td',
							null,
							description
						)
					),
					React.createElement(
						'tr',
						null,
						React.createElement(
							'td',
							null,
							saveButton,
							' ',
							toggleEditButton
						)
					)
				)
			)
		);
	},
	toggleEdit: function toggleEdit() {
		this.setState({ edit: !this.state.edit });
	},
	save: function save() {
		this.props.save(this.refs.title.value, this.refs.description.value);
		this.setState({ edit: false });
	}
});

ReactDOM.render(React.createElement(QuestPage, null), document.getElementById('main-section'));
},{"../factory":8,"../helpers/cs":9,"../schemas":10,"../server":11,"react-addons-update":3}],2:[function(require,module,exports){
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
module.exports = require('react/lib/update');
},{"react/lib/update":7}],4:[function(require,module,exports){
/**
 * Copyright 2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule Object.assign
 */

// https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.assign

function assign(target, sources) {
  if (target == null) {
    throw new TypeError('Object.assign target cannot be null or undefined');
  }

  var to = Object(target);
  var hasOwnProperty = Object.prototype.hasOwnProperty;

  for (var nextIndex = 1; nextIndex < arguments.length; nextIndex++) {
    var nextSource = arguments[nextIndex];
    if (nextSource == null) {
      continue;
    }

    var from = Object(nextSource);

    // We don't currently support accessors nor proxies. Therefore this
    // copy cannot throw. If we ever supported this then we must handle
    // exceptions and side-effects. We don't support symbols so they won't
    // be transferred.

    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
  }

  return to;
};

module.exports = assign;

},{}],5:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule invariant
 */

"use strict";

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var invariant = function(condition, format, a, b, c, d, e, f) {
  if ("production" !== process.env.NODE_ENV) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  }

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error(
        'Minified exception occurred; use the non-minified dev environment ' +
        'for the full error message and additional helpful warnings.'
      );
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(
        'Invariant Violation: ' +
        format.replace(/%s/g, function() { return args[argIndex++]; })
      );
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
};

module.exports = invariant;

}).call(this,require('_process'))
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvaW52YXJpYW50LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBpbnZhcmlhbnRcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxuLyoqXG4gKiBVc2UgaW52YXJpYW50KCkgdG8gYXNzZXJ0IHN0YXRlIHdoaWNoIHlvdXIgcHJvZ3JhbSBhc3N1bWVzIHRvIGJlIHRydWUuXG4gKlxuICogUHJvdmlkZSBzcHJpbnRmLXN0eWxlIGZvcm1hdCAob25seSAlcyBpcyBzdXBwb3J0ZWQpIGFuZCBhcmd1bWVudHNcbiAqIHRvIHByb3ZpZGUgaW5mb3JtYXRpb24gYWJvdXQgd2hhdCBicm9rZSBhbmQgd2hhdCB5b3Ugd2VyZVxuICogZXhwZWN0aW5nLlxuICpcbiAqIFRoZSBpbnZhcmlhbnQgbWVzc2FnZSB3aWxsIGJlIHN0cmlwcGVkIGluIHByb2R1Y3Rpb24sIGJ1dCB0aGUgaW52YXJpYW50XG4gKiB3aWxsIHJlbWFpbiB0byBlbnN1cmUgbG9naWMgZG9lcyBub3QgZGlmZmVyIGluIHByb2R1Y3Rpb24uXG4gKi9cblxudmFyIGludmFyaWFudCA9IGZ1bmN0aW9uKGNvbmRpdGlvbiwgZm9ybWF0LCBhLCBiLCBjLCBkLCBlLCBmKSB7XG4gIGlmIChcInByb2R1Y3Rpb25cIiAhPT0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYpIHtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW52YXJpYW50IHJlcXVpcmVzIGFuIGVycm9yIG1lc3NhZ2UgYXJndW1lbnQnKTtcbiAgICB9XG4gIH1cblxuICBpZiAoIWNvbmRpdGlvbikge1xuICAgIHZhciBlcnJvcjtcbiAgICBpZiAoZm9ybWF0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnTWluaWZpZWQgZXhjZXB0aW9uIG9jY3VycmVkOyB1c2UgdGhlIG5vbi1taW5pZmllZCBkZXYgZW52aXJvbm1lbnQgJyArXG4gICAgICAgICdmb3IgdGhlIGZ1bGwgZXJyb3IgbWVzc2FnZSBhbmQgYWRkaXRpb25hbCBoZWxwZnVsIHdhcm5pbmdzLidcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBhcmdzID0gW2EsIGIsIGMsIGQsIGUsIGZdO1xuICAgICAgdmFyIGFyZ0luZGV4ID0gMDtcbiAgICAgIGVycm9yID0gbmV3IEVycm9yKFxuICAgICAgICAnSW52YXJpYW50IFZpb2xhdGlvbjogJyArXG4gICAgICAgIGZvcm1hdC5yZXBsYWNlKC8lcy9nLCBmdW5jdGlvbigpIHsgcmV0dXJuIGFyZ3NbYXJnSW5kZXgrK107IH0pXG4gICAgICApO1xuICAgIH1cblxuICAgIGVycm9yLmZyYW1lc1RvUG9wID0gMTsgLy8gd2UgZG9uJ3QgY2FyZSBhYm91dCBpbnZhcmlhbnQncyBvd24gZnJhbWVcbiAgICB0aHJvdyBlcnJvcjtcbiAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBpbnZhcmlhbnQ7XG4iXX0=
},{"_process":2}],6:[function(require,module,exports){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule keyOf
 */

/**
 * Allows extraction of a minified key. Let's the build system minify keys
 * without loosing the ability to dynamically use key strings as values
 * themselves. Pass in an object with a single key/val pair and it will return
 * you the string key of that single record. Suppose you want to grab the
 * value for a key 'className' inside of an object. Key/val minification may
 * have aliased that key to be 'xa12'. keyOf({className: null}) will return
 * 'xa12' in that case. Resolve keys you want to use once at startup time, then
 * reuse those resolutions.
 */
var keyOf = function(oneKeyObj) {
  var key;
  for (key in oneKeyObj) {
    if (!oneKeyObj.hasOwnProperty(key)) {
      continue;
    }
    return key;
  }
  return null;
};


module.exports = keyOf;

},{}],7:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule update
 */

"use strict";

var assign = require("./Object.assign");
var keyOf = require("./keyOf");
var invariant = require("./invariant");

function shallowCopy(x) {
  if (Array.isArray(x)) {
    return x.concat();
  } else if (x && typeof x === 'object') {
    return assign(new x.constructor(), x);
  } else {
    return x;
  }
}

var COMMAND_PUSH = keyOf({$push: null});
var COMMAND_UNSHIFT = keyOf({$unshift: null});
var COMMAND_SPLICE = keyOf({$splice: null});
var COMMAND_SET = keyOf({$set: null});
var COMMAND_MERGE = keyOf({$merge: null});
var COMMAND_APPLY = keyOf({$apply: null});

var ALL_COMMANDS_LIST = [
  COMMAND_PUSH,
  COMMAND_UNSHIFT,
  COMMAND_SPLICE,
  COMMAND_SET,
  COMMAND_MERGE,
  COMMAND_APPLY
];

var ALL_COMMANDS_SET = {};

ALL_COMMANDS_LIST.forEach(function(command) {
  ALL_COMMANDS_SET[command] = true;
});

function invariantArrayCase(value, spec, command) {
  ("production" !== process.env.NODE_ENV ? invariant(
    Array.isArray(value),
    'update(): expected target of %s to be an array; got %s.',
    command,
    value
  ) : invariant(Array.isArray(value)));
  var specValue = spec[command];
  ("production" !== process.env.NODE_ENV ? invariant(
    Array.isArray(specValue),
    'update(): expected spec of %s to be an array; got %s. ' +
    'Did you forget to wrap your parameter in an array?',
    command,
    specValue
  ) : invariant(Array.isArray(specValue)));
}

function update(value, spec) {
  ("production" !== process.env.NODE_ENV ? invariant(
    typeof spec === 'object',
    'update(): You provided a key path to update() that did not contain one ' +
    'of %s. Did you forget to include {%s: ...}?',
    ALL_COMMANDS_LIST.join(', '),
    COMMAND_SET
  ) : invariant(typeof spec === 'object'));

  if (spec.hasOwnProperty(COMMAND_SET)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      Object.keys(spec).length === 1,
      'Cannot have more than one key in an object with %s',
      COMMAND_SET
    ) : invariant(Object.keys(spec).length === 1));

    return spec[COMMAND_SET];
  }

  var nextValue = shallowCopy(value);

  if (spec.hasOwnProperty(COMMAND_MERGE)) {
    var mergeObj = spec[COMMAND_MERGE];
    ("production" !== process.env.NODE_ENV ? invariant(
      mergeObj && typeof mergeObj === 'object',
      'update(): %s expects a spec of type \'object\'; got %s',
      COMMAND_MERGE,
      mergeObj
    ) : invariant(mergeObj && typeof mergeObj === 'object'));
    ("production" !== process.env.NODE_ENV ? invariant(
      nextValue && typeof nextValue === 'object',
      'update(): %s expects a target of type \'object\'; got %s',
      COMMAND_MERGE,
      nextValue
    ) : invariant(nextValue && typeof nextValue === 'object'));
    assign(nextValue, spec[COMMAND_MERGE]);
  }

  if (spec.hasOwnProperty(COMMAND_PUSH)) {
    invariantArrayCase(value, spec, COMMAND_PUSH);
    spec[COMMAND_PUSH].forEach(function(item) {
      nextValue.push(item);
    });
  }

  if (spec.hasOwnProperty(COMMAND_UNSHIFT)) {
    invariantArrayCase(value, spec, COMMAND_UNSHIFT);
    spec[COMMAND_UNSHIFT].forEach(function(item) {
      nextValue.unshift(item);
    });
  }

  if (spec.hasOwnProperty(COMMAND_SPLICE)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      Array.isArray(value),
      'Expected %s target to be an array; got %s',
      COMMAND_SPLICE,
      value
    ) : invariant(Array.isArray(value)));
    ("production" !== process.env.NODE_ENV ? invariant(
      Array.isArray(spec[COMMAND_SPLICE]),
      'update(): expected spec of %s to be an array of arrays; got %s. ' +
      'Did you forget to wrap your parameters in an array?',
      COMMAND_SPLICE,
      spec[COMMAND_SPLICE]
    ) : invariant(Array.isArray(spec[COMMAND_SPLICE])));
    spec[COMMAND_SPLICE].forEach(function(args) {
      ("production" !== process.env.NODE_ENV ? invariant(
        Array.isArray(args),
        'update(): expected spec of %s to be an array of arrays; got %s. ' +
        'Did you forget to wrap your parameters in an array?',
        COMMAND_SPLICE,
        spec[COMMAND_SPLICE]
      ) : invariant(Array.isArray(args)));
      nextValue.splice.apply(nextValue, args);
    });
  }

  if (spec.hasOwnProperty(COMMAND_APPLY)) {
    ("production" !== process.env.NODE_ENV ? invariant(
      typeof spec[COMMAND_APPLY] === 'function',
      'update(): expected spec of %s to be a function; got %s.',
      COMMAND_APPLY,
      spec[COMMAND_APPLY]
    ) : invariant(typeof spec[COMMAND_APPLY] === 'function'));
    nextValue = spec[COMMAND_APPLY](nextValue);
  }

  for (var k in spec) {
    if (!(ALL_COMMANDS_SET.hasOwnProperty(k) && ALL_COMMANDS_SET[k])) {
      nextValue[k] = update(value[k], spec[k]);
    }
  }

  return nextValue;
}

module.exports = update;

}).call(this,require('_process'))
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9yZWFjdC9saWIvdXBkYXRlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTMtMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSB1cGRhdGVcbiAqL1xuXG5cInVzZSBzdHJpY3RcIjtcblxudmFyIGFzc2lnbiA9IHJlcXVpcmUoXCIuL09iamVjdC5hc3NpZ25cIik7XG52YXIga2V5T2YgPSByZXF1aXJlKFwiLi9rZXlPZlwiKTtcbnZhciBpbnZhcmlhbnQgPSByZXF1aXJlKFwiLi9pbnZhcmlhbnRcIik7XG5cbmZ1bmN0aW9uIHNoYWxsb3dDb3B5KHgpIHtcbiAgaWYgKEFycmF5LmlzQXJyYXkoeCkpIHtcbiAgICByZXR1cm4geC5jb25jYXQoKTtcbiAgfSBlbHNlIGlmICh4ICYmIHR5cGVvZiB4ID09PSAnb2JqZWN0Jykge1xuICAgIHJldHVybiBhc3NpZ24obmV3IHguY29uc3RydWN0b3IoKSwgeCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIHg7XG4gIH1cbn1cblxudmFyIENPTU1BTkRfUFVTSCA9IGtleU9mKHskcHVzaDogbnVsbH0pO1xudmFyIENPTU1BTkRfVU5TSElGVCA9IGtleU9mKHskdW5zaGlmdDogbnVsbH0pO1xudmFyIENPTU1BTkRfU1BMSUNFID0ga2V5T2YoeyRzcGxpY2U6IG51bGx9KTtcbnZhciBDT01NQU5EX1NFVCA9IGtleU9mKHskc2V0OiBudWxsfSk7XG52YXIgQ09NTUFORF9NRVJHRSA9IGtleU9mKHskbWVyZ2U6IG51bGx9KTtcbnZhciBDT01NQU5EX0FQUExZID0ga2V5T2YoeyRhcHBseTogbnVsbH0pO1xuXG52YXIgQUxMX0NPTU1BTkRTX0xJU1QgPSBbXG4gIENPTU1BTkRfUFVTSCxcbiAgQ09NTUFORF9VTlNISUZULFxuICBDT01NQU5EX1NQTElDRSxcbiAgQ09NTUFORF9TRVQsXG4gIENPTU1BTkRfTUVSR0UsXG4gIENPTU1BTkRfQVBQTFlcbl07XG5cbnZhciBBTExfQ09NTUFORFNfU0VUID0ge307XG5cbkFMTF9DT01NQU5EU19MSVNULmZvckVhY2goZnVuY3Rpb24oY29tbWFuZCkge1xuICBBTExfQ09NTUFORFNfU0VUW2NvbW1hbmRdID0gdHJ1ZTtcbn0pO1xuXG5mdW5jdGlvbiBpbnZhcmlhbnRBcnJheUNhc2UodmFsdWUsIHNwZWMsIGNvbW1hbmQpIHtcbiAgKFwicHJvZHVjdGlvblwiICE9PSBwcm9jZXNzLmVudi5OT0RFX0VOViA/IGludmFyaWFudChcbiAgICBBcnJheS5pc0FycmF5KHZhbHVlKSxcbiAgICAndXBkYXRlKCk6IGV4cGVjdGVkIHRhcmdldCBvZiAlcyB0byBiZSBhbiBhcnJheTsgZ290ICVzLicsXG4gICAgY29tbWFuZCxcbiAgICB2YWx1ZVxuICApIDogaW52YXJpYW50KEFycmF5LmlzQXJyYXkodmFsdWUpKSk7XG4gIHZhciBzcGVjVmFsdWUgPSBzcGVjW2NvbW1hbmRdO1xuICAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WID8gaW52YXJpYW50KFxuICAgIEFycmF5LmlzQXJyYXkoc3BlY1ZhbHVlKSxcbiAgICAndXBkYXRlKCk6IGV4cGVjdGVkIHNwZWMgb2YgJXMgdG8gYmUgYW4gYXJyYXk7IGdvdCAlcy4gJyArXG4gICAgJ0RpZCB5b3UgZm9yZ2V0IHRvIHdyYXAgeW91ciBwYXJhbWV0ZXIgaW4gYW4gYXJyYXk/JyxcbiAgICBjb21tYW5kLFxuICAgIHNwZWNWYWx1ZVxuICApIDogaW52YXJpYW50KEFycmF5LmlzQXJyYXkoc3BlY1ZhbHVlKSkpO1xufVxuXG5mdW5jdGlvbiB1cGRhdGUodmFsdWUsIHNwZWMpIHtcbiAgKFwicHJvZHVjdGlvblwiICE9PSBwcm9jZXNzLmVudi5OT0RFX0VOViA/IGludmFyaWFudChcbiAgICB0eXBlb2Ygc3BlYyA9PT0gJ29iamVjdCcsXG4gICAgJ3VwZGF0ZSgpOiBZb3UgcHJvdmlkZWQgYSBrZXkgcGF0aCB0byB1cGRhdGUoKSB0aGF0IGRpZCBub3QgY29udGFpbiBvbmUgJyArXG4gICAgJ29mICVzLiBEaWQgeW91IGZvcmdldCB0byBpbmNsdWRlIHslczogLi4ufT8nLFxuICAgIEFMTF9DT01NQU5EU19MSVNULmpvaW4oJywgJyksXG4gICAgQ09NTUFORF9TRVRcbiAgKSA6IGludmFyaWFudCh0eXBlb2Ygc3BlYyA9PT0gJ29iamVjdCcpKTtcblxuICBpZiAoc3BlYy5oYXNPd25Qcm9wZXJ0eShDT01NQU5EX1NFVCkpIHtcbiAgICAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WID8gaW52YXJpYW50KFxuICAgICAgT2JqZWN0LmtleXMoc3BlYykubGVuZ3RoID09PSAxLFxuICAgICAgJ0Nhbm5vdCBoYXZlIG1vcmUgdGhhbiBvbmUga2V5IGluIGFuIG9iamVjdCB3aXRoICVzJyxcbiAgICAgIENPTU1BTkRfU0VUXG4gICAgKSA6IGludmFyaWFudChPYmplY3Qua2V5cyhzcGVjKS5sZW5ndGggPT09IDEpKTtcblxuICAgIHJldHVybiBzcGVjW0NPTU1BTkRfU0VUXTtcbiAgfVxuXG4gIHZhciBuZXh0VmFsdWUgPSBzaGFsbG93Q29weSh2YWx1ZSk7XG5cbiAgaWYgKHNwZWMuaGFzT3duUHJvcGVydHkoQ09NTUFORF9NRVJHRSkpIHtcbiAgICB2YXIgbWVyZ2VPYmogPSBzcGVjW0NPTU1BTkRfTUVSR0VdO1xuICAgIChcInByb2R1Y3Rpb25cIiAhPT0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPyBpbnZhcmlhbnQoXG4gICAgICBtZXJnZU9iaiAmJiB0eXBlb2YgbWVyZ2VPYmogPT09ICdvYmplY3QnLFxuICAgICAgJ3VwZGF0ZSgpOiAlcyBleHBlY3RzIGEgc3BlYyBvZiB0eXBlIFxcJ29iamVjdFxcJzsgZ290ICVzJyxcbiAgICAgIENPTU1BTkRfTUVSR0UsXG4gICAgICBtZXJnZU9ialxuICAgICkgOiBpbnZhcmlhbnQobWVyZ2VPYmogJiYgdHlwZW9mIG1lcmdlT2JqID09PSAnb2JqZWN0JykpO1xuICAgIChcInByb2R1Y3Rpb25cIiAhPT0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPyBpbnZhcmlhbnQoXG4gICAgICBuZXh0VmFsdWUgJiYgdHlwZW9mIG5leHRWYWx1ZSA9PT0gJ29iamVjdCcsXG4gICAgICAndXBkYXRlKCk6ICVzIGV4cGVjdHMgYSB0YXJnZXQgb2YgdHlwZSBcXCdvYmplY3RcXCc7IGdvdCAlcycsXG4gICAgICBDT01NQU5EX01FUkdFLFxuICAgICAgbmV4dFZhbHVlXG4gICAgKSA6IGludmFyaWFudChuZXh0VmFsdWUgJiYgdHlwZW9mIG5leHRWYWx1ZSA9PT0gJ29iamVjdCcpKTtcbiAgICBhc3NpZ24obmV4dFZhbHVlLCBzcGVjW0NPTU1BTkRfTUVSR0VdKTtcbiAgfVxuXG4gIGlmIChzcGVjLmhhc093blByb3BlcnR5KENPTU1BTkRfUFVTSCkpIHtcbiAgICBpbnZhcmlhbnRBcnJheUNhc2UodmFsdWUsIHNwZWMsIENPTU1BTkRfUFVTSCk7XG4gICAgc3BlY1tDT01NQU5EX1BVU0hdLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgbmV4dFZhbHVlLnB1c2goaXRlbSk7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoc3BlYy5oYXNPd25Qcm9wZXJ0eShDT01NQU5EX1VOU0hJRlQpKSB7XG4gICAgaW52YXJpYW50QXJyYXlDYXNlKHZhbHVlLCBzcGVjLCBDT01NQU5EX1VOU0hJRlQpO1xuICAgIHNwZWNbQ09NTUFORF9VTlNISUZUXS5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIG5leHRWYWx1ZS51bnNoaWZ0KGl0ZW0pO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHNwZWMuaGFzT3duUHJvcGVydHkoQ09NTUFORF9TUExJQ0UpKSB7XG4gICAgKFwicHJvZHVjdGlvblwiICE9PSBwcm9jZXNzLmVudi5OT0RFX0VOViA/IGludmFyaWFudChcbiAgICAgIEFycmF5LmlzQXJyYXkodmFsdWUpLFxuICAgICAgJ0V4cGVjdGVkICVzIHRhcmdldCB0byBiZSBhbiBhcnJheTsgZ290ICVzJyxcbiAgICAgIENPTU1BTkRfU1BMSUNFLFxuICAgICAgdmFsdWVcbiAgICApIDogaW52YXJpYW50KEFycmF5LmlzQXJyYXkodmFsdWUpKSk7XG4gICAgKFwicHJvZHVjdGlvblwiICE9PSBwcm9jZXNzLmVudi5OT0RFX0VOViA/IGludmFyaWFudChcbiAgICAgIEFycmF5LmlzQXJyYXkoc3BlY1tDT01NQU5EX1NQTElDRV0pLFxuICAgICAgJ3VwZGF0ZSgpOiBleHBlY3RlZCBzcGVjIG9mICVzIHRvIGJlIGFuIGFycmF5IG9mIGFycmF5czsgZ290ICVzLiAnICtcbiAgICAgICdEaWQgeW91IGZvcmdldCB0byB3cmFwIHlvdXIgcGFyYW1ldGVycyBpbiBhbiBhcnJheT8nLFxuICAgICAgQ09NTUFORF9TUExJQ0UsXG4gICAgICBzcGVjW0NPTU1BTkRfU1BMSUNFXVxuICAgICkgOiBpbnZhcmlhbnQoQXJyYXkuaXNBcnJheShzcGVjW0NPTU1BTkRfU1BMSUNFXSkpKTtcbiAgICBzcGVjW0NPTU1BTkRfU1BMSUNFXS5mb3JFYWNoKGZ1bmN0aW9uKGFyZ3MpIHtcbiAgICAgIChcInByb2R1Y3Rpb25cIiAhPT0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPyBpbnZhcmlhbnQoXG4gICAgICAgIEFycmF5LmlzQXJyYXkoYXJncyksXG4gICAgICAgICd1cGRhdGUoKTogZXhwZWN0ZWQgc3BlYyBvZiAlcyB0byBiZSBhbiBhcnJheSBvZiBhcnJheXM7IGdvdCAlcy4gJyArXG4gICAgICAgICdEaWQgeW91IGZvcmdldCB0byB3cmFwIHlvdXIgcGFyYW1ldGVycyBpbiBhbiBhcnJheT8nLFxuICAgICAgICBDT01NQU5EX1NQTElDRSxcbiAgICAgICAgc3BlY1tDT01NQU5EX1NQTElDRV1cbiAgICAgICkgOiBpbnZhcmlhbnQoQXJyYXkuaXNBcnJheShhcmdzKSkpO1xuICAgICAgbmV4dFZhbHVlLnNwbGljZS5hcHBseShuZXh0VmFsdWUsIGFyZ3MpO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKHNwZWMuaGFzT3duUHJvcGVydHkoQ09NTUFORF9BUFBMWSkpIHtcbiAgICAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WID8gaW52YXJpYW50KFxuICAgICAgdHlwZW9mIHNwZWNbQ09NTUFORF9BUFBMWV0gPT09ICdmdW5jdGlvbicsXG4gICAgICAndXBkYXRlKCk6IGV4cGVjdGVkIHNwZWMgb2YgJXMgdG8gYmUgYSBmdW5jdGlvbjsgZ290ICVzLicsXG4gICAgICBDT01NQU5EX0FQUExZLFxuICAgICAgc3BlY1tDT01NQU5EX0FQUExZXVxuICAgICkgOiBpbnZhcmlhbnQodHlwZW9mIHNwZWNbQ09NTUFORF9BUFBMWV0gPT09ICdmdW5jdGlvbicpKTtcbiAgICBuZXh0VmFsdWUgPSBzcGVjW0NPTU1BTkRfQVBQTFldKG5leHRWYWx1ZSk7XG4gIH1cblxuICBmb3IgKHZhciBrIGluIHNwZWMpIHtcbiAgICBpZiAoIShBTExfQ09NTUFORFNfU0VULmhhc093blByb3BlcnR5KGspICYmIEFMTF9DT01NQU5EU19TRVRba10pKSB7XG4gICAgICBuZXh0VmFsdWVba10gPSB1cGRhdGUodmFsdWVba10sIHNwZWNba10pO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBuZXh0VmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gdXBkYXRlO1xuIl19
},{"./Object.assign":4,"./invariant":5,"./keyOf":6,"_process":2}],8:[function(require,module,exports){
'use strict';

module.exports = {
	quest: function quest(user, _quest) {
		var result = {
			user: {
				id: user.id,
				name: user.name
			}
		};

		if (_quest) {
			result.id = _quest.id;
			result.title = _quest.title;
			result.description = _quest.description;
			result.dirty = false;
		} else {
			result.id = null;
			result.title = '';
			result.description = '';
			result.dirty = true;
		}

		return result;
	}
};
},{}],9:[function(require,module,exports){
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
				} else if (xhr.status === 404) {
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
				} else if (xhr.status === 404) {
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
},{}],10:[function(require,module,exports){
'use strict';

//var _ = require('lodash');

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
	user: user
};
},{}],11:[function(require,module,exports){
'use strict';

var cs = require('./helpers/cs');
//var inspector = require('schema-inspector');
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
	}
};
},{"./helpers/cs":9,"./schemas":10}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjL3NjcmlwdHMvcXVlc3RfcGFnZS9xdWVzdF9wYWdlLmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9yZWFjdC1hZGRvbnMtdXBkYXRlL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0L2xpYi9PYmplY3QuYXNzaWduLmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0L2xpYi9pbnZhcmlhbnQuanMiLCJub2RlX21vZHVsZXMvcmVhY3QvbGliL2tleU9mLmpzIiwibm9kZV9tb2R1bGVzL3JlYWN0L2xpYi91cGRhdGUuanMiLCJzcmMvc2NyaXB0cy9mYWN0b3J5LmpzIiwic3JjL3NjcmlwdHMvaGVscGVycy9jcy5qcyIsInNyYy9zY3JpcHRzL3NjaGVtYXMuanMiLCJzcmMvc2NyaXB0cy9zZXJ2ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTs7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdktBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNzID0gcmVxdWlyZSgnLi4vaGVscGVycy9jcycpO1xudmFyIGZhY3RvcnkgPSByZXF1aXJlKCcuLi9mYWN0b3J5Jyk7XG52YXIgc3RhdHVzZXMgPSB7XG5cdElOSVQ6ICdJTklUJyxcblx0UkVBRFk6ICdSRUFEWScsXG5cdFNBVklORzogJ1NBVklORycsXG5cdE5PVF9GT1VORDogJ05PVF9GT1VORCcsXG5cdEVSUk9SOiAnRVJST1InXG59O1xudmFyIHVwZGF0ZSA9IHJlcXVpcmUoJ3JlYWN0LWFkZG9ucy11cGRhdGUnKTtcbnZhciBzZXJ2ZXIgPSByZXF1aXJlKCcuLi9zZXJ2ZXInKTtcbnZhciBzY2hlbWFzID0gcmVxdWlyZSgnLi4vc2NoZW1hcycpO1xuXG52YXIgUXVlc3RQYWdlID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ1F1ZXN0UGFnZScsXG5cblx0Z2V0SW5pdGlhbFN0YXRlOiBmdW5jdGlvbiBnZXRJbml0aWFsU3RhdGUoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXR1czogc3RhdHVzZXMuSU5JVCxcblx0XHRcdHF1ZXN0OiB7fSxcblx0XHRcdGxvZ2dlZEluOiBiZWxsYS5kYXRhLnVzZXIuZ2V0KCkuc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMudXNlclN0YXR1cy5MT0dHRURfSU5cblx0XHR9O1xuXHR9LFxuXHRjb21wb25lbnREaWRNb3VudDogZnVuY3Rpb24gY29tcG9uZW50RGlkTW91bnQoKSB7XG5cdFx0dmFyIF90aGlzID0gdGhpcztcblxuXHRcdHZhciB3aXNoSWQgPSBjcy5nZXRRdWVyeVZhbHVlKGRvY3VtZW50LmxvY2F0aW9uLnNlYXJjaCwgJ3F1ZXN0X2lkJyk7XG5cblx0XHRiZWxsYS5kYXRhLnVzZXIuc3Vic2NyaWJlKGZ1bmN0aW9uICh1c2VyKSB7XG5cdFx0XHRfdGhpcy5zZXRTdGF0ZSh7IGxvZ2dlZEluOiB1c2VyLnN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnVzZXJTdGF0dXMuTE9HR0VEX0lOIH0pO1xuXHRcdH0pO1xuXG5cdFx0aWYgKHdpc2hJZCkge1xuXHRcdFx0c2VydmVyLndpc2guZ2V0KHdpc2hJZCwgZnVuY3Rpb24gKHJlc3VsdCwgd2lzaCkge1xuXHRcdFx0XHRpZiAocmVzdWx0LnN1Y2Nlc3MpIHtcblx0XHRcdFx0XHRfdGhpcy5zZXRTdGF0ZSh7XG5cdFx0XHRcdFx0XHRxdWVzdDogd2lzaCxcblx0XHRcdFx0XHRcdHN0YXR1czogc3RhdHVzZXMuUkVBRFlcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhyZXN1bHQubWVzc2FnZSk7XG5cdFx0XHRcdFx0X3RoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdFx0c3RhdHVzOiBzdGF0dXNlcy5OT1RfRk9VTkRcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuc2V0U3RhdGUoe1xuXHRcdFx0XHRxdWVzdDogc2NoZW1hcy53aXNoLmJsYW5rKGJlbGxhLmRhdGEudXNlci5nZXQoKSksXG5cdFx0XHRcdHN0YXR1czogc3RhdHVzZXMuUkVBRFlcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblx0cmVuZGVyOiBmdW5jdGlvbiByZW5kZXIoKSB7XG5cdFx0dmFyIHBhZ2U7XG5cblx0XHRpZiAodGhpcy5zdGF0ZS5zdGF0dXMgPT09IHN0YXR1c2VzLklOSVQpIHtcblx0XHRcdHBhZ2UgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHQnZGl2Jyxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0J2luaXQnXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zdGF0dXMgPT09IHN0YXR1c2VzLk5PVF9GT1VORCkge1xuXHRcdFx0cGFnZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHQnbm90IGZvdW5kJ1xuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuc3RhdGUuc3RhdHVzID09PSBzdGF0dXNlcy5FUlJPUikge1xuXHRcdFx0cGFnZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHQnZXJyb3InXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5zdGF0ZS5zdGF0dXMgPT09IHN0YXR1c2VzLlNBVklORykge1xuXHRcdFx0cGFnZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHQnc2F2aW5nJ1xuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuc3RhdGUuc3RhdHVzID09PSBzdGF0dXNlcy5SRUFEWSkge1xuXHRcdFx0cGFnZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHR7IGNsYXNzTmFtZTogJ2JjLXF1ZXN0LXBhZ2UnIH0sXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J2gxJyxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdCdRdWVzdCdcblx0XHRcdFx0KSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChSQ1F1ZXN0LCB7XG5cdFx0XHRcdFx0cXVlc3Q6IHRoaXMuc3RhdGUucXVlc3QsXG5cdFx0XHRcdFx0b3duOiB0aGlzLnN0YXRlLnF1ZXN0LnVzZXIgJiYgdGhpcy5zdGF0ZS5xdWVzdC51c2VyLmlkID09PSBjcy5jb29raWUoJ3VzZXJfaWQnLCBkb2N1bWVudC5jb29raWUpLFxuXHRcdFx0XHRcdGxvZ2dlZEluOiB0aGlzLnN0YXRlLmxvZ2dlZEluLFxuXHRcdFx0XHRcdHNhdmU6IHRoaXMuc2F2ZSB9KVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcGFnZTtcblx0fSxcblx0c2F2ZTogZnVuY3Rpb24gc2F2ZSh0aXRsZSwgZGVzY3JpcHRpb24pIHtcblx0XHR2YXIgX3RoaXMyID0gdGhpcztcblxuXHRcdHRoaXMuc2V0U3RhdGUoeyBzdGF0dXM6IHN0YXR1c2VzLlNBVklORyB9KTtcblx0XHRzZXJ2ZXIud2lzaC5wb3N0KHVwZGF0ZSh0aGlzLnN0YXRlLnF1ZXN0LCB7IHRpdGxlOiB7ICRzZXQ6IHRpdGxlIH0sIGRlc2NyaXB0aW9uOiB7ICRzZXQ6IGRlc2NyaXB0aW9uIH0gfSksIGZ1bmN0aW9uIChyZXN1bHQpIHtcblx0XHRcdGlmIChyZXN1bHQuc3VjY2Vzcykge1xuXHRcdFx0XHRfdGhpczIuc2V0U3RhdGUoe1xuXHRcdFx0XHRcdHN0YXR1czogc3RhdHVzZXMuU0FWSU5HXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHR3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvcXVlc3RfbGlzdC5odG1sJztcblx0XHRcdH1cblx0XHR9KTtcblx0fVxufSk7XG5cbnZhciBSQ1F1ZXN0ID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuXHRkaXNwbGF5TmFtZTogJ1JDUXVlc3QnLFxuXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuXHRcdHJldHVybiB7IGVkaXQ6ICF0aGlzLnByb3BzLnF1ZXN0LmlkIH07XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciB0b2dnbGVFZGl0QnV0dG9uID0gdGhpcy5wcm9wcy5vd24gJiYgdGhpcy5wcm9wcy5sb2dnZWRJbiA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnYnV0dG9uJyxcblx0XHRcdHsgb25DbGljazogdGhpcy50b2dnbGVFZGl0IH0sXG5cdFx0XHR0aGlzLnN0YXRlLmVkaXQgPyAnQ2FuY2VsJyA6ICdFZGl0J1xuXHRcdCkgOiBudWxsO1xuXHRcdHZhciBzYXZlQnV0dG9uID0gdGhpcy5wcm9wcy5xdWVzdC5kaXJ0eSB8fCB0aGlzLnN0YXRlLmVkaXQgPyBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2J1dHRvbicsXG5cdFx0XHR7IG9uQ2xpY2s6IHRoaXMuc2F2ZSB9LFxuXHRcdFx0J1NhdmUnXG5cdFx0KSA6IG51bGw7XG5cdFx0dmFyIHRpdGxlID0gdGhpcy5zdGF0ZS5lZGl0ID8gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7IHR5cGU6ICd0ZXh0JywgZGVmYXVsdFZhbHVlOiB0aGlzLnByb3BzLnF1ZXN0LnRpdGxlLCByZWY6ICd0aXRsZScgfSkgOiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J3NwYW4nLFxuXHRcdFx0bnVsbCxcblx0XHRcdHRoaXMucHJvcHMucXVlc3QudGl0bGVcblx0XHQpO1xuXHRcdHZhciBkZXNjcmlwdGlvbiA9IHRoaXMuc3RhdGUuZWRpdCA/IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ3RleHRhcmVhJywgeyBjb2xzOiAnMzAnLCByb3dzOiAnMTAnLCBkZWZhdWx0VmFsdWU6IHRoaXMucHJvcHMucXVlc3QuZGVzY3JpcHRpb24sIHJlZjogJ2Rlc2NyaXB0aW9uJyB9KSA6IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHQnc3BhbicsXG5cdFx0XHRudWxsLFxuXHRcdFx0dGhpcy5wcm9wcy5xdWVzdC5kZXNjcmlwdGlvblxuXHRcdCk7XG5cdFx0dmFyIHVzZXIgPSB0aGlzLnByb3BzLnF1ZXN0LnVzZXIgPyBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J3RyJyxcblx0XHRcdG51bGwsXG5cdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHQndGQnLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHQndXNlcjonXG5cdFx0XHQpLFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0J3RkJyxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0dGhpcy5wcm9wcy5xdWVzdC51c2VyLm5hbWVcblx0XHRcdClcblx0XHQpIDogbnVsbDtcblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHRudWxsLFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0J3RhYmxlJyxcblx0XHRcdFx0bnVsbCxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQndGJvZHknLFxuXHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0dXNlcixcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0J3RyJyxcblx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGQnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHQndGl0bGU6J1xuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdHRpdGxlXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0J3RyJyxcblx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGQnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHQnZGVzY3JpcHRpb246J1xuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0J3RyJyxcblx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGQnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRzYXZlQnV0dG9uLFxuXHRcdFx0XHRcdFx0XHQnICcsXG5cdFx0XHRcdFx0XHRcdHRvZ2dsZUVkaXRCdXR0b25cblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpXG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXHR9LFxuXHR0b2dnbGVFZGl0OiBmdW5jdGlvbiB0b2dnbGVFZGl0KCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBlZGl0OiAhdGhpcy5zdGF0ZS5lZGl0IH0pO1xuXHR9LFxuXHRzYXZlOiBmdW5jdGlvbiBzYXZlKCkge1xuXHRcdHRoaXMucHJvcHMuc2F2ZSh0aGlzLnJlZnMudGl0bGUudmFsdWUsIHRoaXMucmVmcy5kZXNjcmlwdGlvbi52YWx1ZSk7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGVkaXQ6IGZhbHNlIH0pO1xuXHR9XG59KTtcblxuUmVhY3RET00ucmVuZGVyKFJlYWN0LmNyZWF0ZUVsZW1lbnQoUXVlc3RQYWdlLCBudWxsKSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4tc2VjdGlvbicpKTsiLCIvLyBzaGltIGZvciB1c2luZyBwcm9jZXNzIGluIGJyb3dzZXJcblxudmFyIHByb2Nlc3MgPSBtb2R1bGUuZXhwb3J0cyA9IHt9O1xudmFyIHF1ZXVlID0gW107XG52YXIgZHJhaW5pbmcgPSBmYWxzZTtcblxuZnVuY3Rpb24gZHJhaW5RdWV1ZSgpIHtcbiAgICBpZiAoZHJhaW5pbmcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IHRydWU7XG4gICAgdmFyIGN1cnJlbnRRdWV1ZTtcbiAgICB2YXIgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIHdoaWxlKGxlbikge1xuICAgICAgICBjdXJyZW50UXVldWUgPSBxdWV1ZTtcbiAgICAgICAgcXVldWUgPSBbXTtcbiAgICAgICAgdmFyIGkgPSAtMTtcbiAgICAgICAgd2hpbGUgKCsraSA8IGxlbikge1xuICAgICAgICAgICAgY3VycmVudFF1ZXVlW2ldKCk7XG4gICAgICAgIH1cbiAgICAgICAgbGVuID0gcXVldWUubGVuZ3RoO1xuICAgIH1cbiAgICBkcmFpbmluZyA9IGZhbHNlO1xufVxucHJvY2Vzcy5uZXh0VGljayA9IGZ1bmN0aW9uIChmdW4pIHtcbiAgICBxdWV1ZS5wdXNoKGZ1bik7XG4gICAgaWYgKCFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbnByb2Nlc3MudGl0bGUgPSAnYnJvd3Nlcic7XG5wcm9jZXNzLmJyb3dzZXIgPSB0cnVlO1xucHJvY2Vzcy5lbnYgPSB7fTtcbnByb2Nlc3MuYXJndiA9IFtdO1xucHJvY2Vzcy52ZXJzaW9uID0gJyc7IC8vIGVtcHR5IHN0cmluZyB0byBhdm9pZCByZWdleHAgaXNzdWVzXG5wcm9jZXNzLnZlcnNpb25zID0ge307XG5cbmZ1bmN0aW9uIG5vb3AoKSB7fVxuXG5wcm9jZXNzLm9uID0gbm9vcDtcbnByb2Nlc3MuYWRkTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5vbmNlID0gbm9vcDtcbnByb2Nlc3Mub2ZmID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlTGlzdGVuZXIgPSBub29wO1xucHJvY2Vzcy5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBub29wO1xucHJvY2Vzcy5lbWl0ID0gbm9vcDtcblxucHJvY2Vzcy5iaW5kaW5nID0gZnVuY3Rpb24gKG5hbWUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3Byb2Nlc3MuYmluZGluZyBpcyBub3Qgc3VwcG9ydGVkJyk7XG59O1xuXG4vLyBUT0RPKHNodHlsbWFuKVxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKCdyZWFjdC9saWIvdXBkYXRlJyk7IiwiLyoqXG4gKiBDb3B5cmlnaHQgMjAxNCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgQlNELXN0eWxlIGxpY2Vuc2UgZm91bmQgaW4gdGhlXG4gKiBMSUNFTlNFIGZpbGUgaW4gdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuIEFuIGFkZGl0aW9uYWwgZ3JhbnRcbiAqIG9mIHBhdGVudCByaWdodHMgY2FuIGJlIGZvdW5kIGluIHRoZSBQQVRFTlRTIGZpbGUgaW4gdGhlIHNhbWUgZGlyZWN0b3J5LlxuICpcbiAqIEBwcm92aWRlc01vZHVsZSBPYmplY3QuYXNzaWduXG4gKi9cblxuLy8gaHR0cHM6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLW9iamVjdC5hc3NpZ25cblxuZnVuY3Rpb24gYXNzaWduKHRhcmdldCwgc291cmNlcykge1xuICBpZiAodGFyZ2V0ID09IG51bGwpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIHRhcmdldCBjYW5ub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKTtcbiAgfVxuXG4gIHZhciB0byA9IE9iamVjdCh0YXJnZXQpO1xuICB2YXIgaGFzT3duUHJvcGVydHkgPSBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5O1xuXG4gIGZvciAodmFyIG5leHRJbmRleCA9IDE7IG5leHRJbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IG5leHRJbmRleCsrKSB7XG4gICAgdmFyIG5leHRTb3VyY2UgPSBhcmd1bWVudHNbbmV4dEluZGV4XTtcbiAgICBpZiAobmV4dFNvdXJjZSA9PSBudWxsKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICB2YXIgZnJvbSA9IE9iamVjdChuZXh0U291cmNlKTtcblxuICAgIC8vIFdlIGRvbid0IGN1cnJlbnRseSBzdXBwb3J0IGFjY2Vzc29ycyBub3IgcHJveGllcy4gVGhlcmVmb3JlIHRoaXNcbiAgICAvLyBjb3B5IGNhbm5vdCB0aHJvdy4gSWYgd2UgZXZlciBzdXBwb3J0ZWQgdGhpcyB0aGVuIHdlIG11c3QgaGFuZGxlXG4gICAgLy8gZXhjZXB0aW9ucyBhbmQgc2lkZS1lZmZlY3RzLiBXZSBkb24ndCBzdXBwb3J0IHN5bWJvbHMgc28gdGhleSB3b24ndFxuICAgIC8vIGJlIHRyYW5zZmVycmVkLlxuXG4gICAgZm9yICh2YXIga2V5IGluIGZyb20pIHtcbiAgICAgIGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcbiAgICAgICAgdG9ba2V5XSA9IGZyb21ba2V5XTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gdG87XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGFzc2lnbjtcbiIsIihmdW5jdGlvbiAocHJvY2Vzcyl7XG4vKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUgaW52YXJpYW50XG4gKi9cblxuXCJ1c2Ugc3RyaWN0XCI7XG5cbi8qKlxuICogVXNlIGludmFyaWFudCgpIHRvIGFzc2VydCBzdGF0ZSB3aGljaCB5b3VyIHByb2dyYW0gYXNzdW1lcyB0byBiZSB0cnVlLlxuICpcbiAqIFByb3ZpZGUgc3ByaW50Zi1zdHlsZSBmb3JtYXQgKG9ubHkgJXMgaXMgc3VwcG9ydGVkKSBhbmQgYXJndW1lbnRzXG4gKiB0byBwcm92aWRlIGluZm9ybWF0aW9uIGFib3V0IHdoYXQgYnJva2UgYW5kIHdoYXQgeW91IHdlcmVcbiAqIGV4cGVjdGluZy5cbiAqXG4gKiBUaGUgaW52YXJpYW50IG1lc3NhZ2Ugd2lsbCBiZSBzdHJpcHBlZCBpbiBwcm9kdWN0aW9uLCBidXQgdGhlIGludmFyaWFudFxuICogd2lsbCByZW1haW4gdG8gZW5zdXJlIGxvZ2ljIGRvZXMgbm90IGRpZmZlciBpbiBwcm9kdWN0aW9uLlxuICovXG5cbnZhciBpbnZhcmlhbnQgPSBmdW5jdGlvbihjb25kaXRpb24sIGZvcm1hdCwgYSwgYiwgYywgZCwgZSwgZikge1xuICBpZiAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WKSB7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2ludmFyaWFudCByZXF1aXJlcyBhbiBlcnJvciBtZXNzYWdlIGFyZ3VtZW50Jyk7XG4gICAgfVxuICB9XG5cbiAgaWYgKCFjb25kaXRpb24pIHtcbiAgICB2YXIgZXJyb3I7XG4gICAgaWYgKGZvcm1hdCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ01pbmlmaWVkIGV4Y2VwdGlvbiBvY2N1cnJlZDsgdXNlIHRoZSBub24tbWluaWZpZWQgZGV2IGVudmlyb25tZW50ICcgK1xuICAgICAgICAnZm9yIHRoZSBmdWxsIGVycm9yIG1lc3NhZ2UgYW5kIGFkZGl0aW9uYWwgaGVscGZ1bCB3YXJuaW5ncy4nXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgYXJncyA9IFthLCBiLCBjLCBkLCBlLCBmXTtcbiAgICAgIHZhciBhcmdJbmRleCA9IDA7XG4gICAgICBlcnJvciA9IG5ldyBFcnJvcihcbiAgICAgICAgJ0ludmFyaWFudCBWaW9sYXRpb246ICcgK1xuICAgICAgICBmb3JtYXQucmVwbGFjZSgvJXMvZywgZnVuY3Rpb24oKSB7IHJldHVybiBhcmdzW2FyZ0luZGV4KytdOyB9KVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBlcnJvci5mcmFtZXNUb1BvcCA9IDE7IC8vIHdlIGRvbid0IGNhcmUgYWJvdXQgaW52YXJpYW50J3Mgb3duIGZyYW1lXG4gICAgdGhyb3cgZXJyb3I7XG4gIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gaW52YXJpYW50O1xuXG59KS5jYWxsKHRoaXMscmVxdWlyZSgnX3Byb2Nlc3MnKSlcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtjaGFyc2V0OnV0Zi04O2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKemIzVnlZMlZ6SWpwYkltNXZaR1ZmYlc5a2RXeGxjeTl5WldGamRDOXNhV0l2YVc1MllYSnBZVzUwTG1weklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN1FVRkJRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFaUxDSm1hV3hsSWpvaVoyVnVaWEpoZEdWa0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJaThxS2x4dUlDb2dRMjl3ZVhKcFoyaDBJREl3TVRNdE1qQXhOQ3dnUm1GalpXSnZiMnNzSUVsdVl5NWNiaUFxSUVGc2JDQnlhV2RvZEhNZ2NtVnpaWEoyWldRdVhHNGdLbHh1SUNvZ1ZHaHBjeUJ6YjNWeVkyVWdZMjlrWlNCcGN5QnNhV05sYm5ObFpDQjFibVJsY2lCMGFHVWdRbE5FTFhOMGVXeGxJR3hwWTJWdWMyVWdabTkxYm1RZ2FXNGdkR2hsWEc0Z0tpQk1TVU5GVGxORklHWnBiR1VnYVc0Z2RHaGxJSEp2YjNRZ1pHbHlaV04wYjNKNUlHOW1JSFJvYVhNZ2MyOTFjbU5sSUhSeVpXVXVJRUZ1SUdGa1pHbDBhVzl1WVd3Z1ozSmhiblJjYmlBcUlHOW1JSEJoZEdWdWRDQnlhV2RvZEhNZ1kyRnVJR0psSUdadmRXNWtJR2x1SUhSb1pTQlFRVlJGVGxSVElHWnBiR1VnYVc0Z2RHaGxJSE5oYldVZ1pHbHlaV04wYjNKNUxseHVJQ3BjYmlBcUlFQndjbTkyYVdSbGMwMXZaSFZzWlNCcGJuWmhjbWxoYm5SY2JpQXFMMXh1WEc1Y0luVnpaU0J6ZEhKcFkzUmNJanRjYmx4dUx5b3FYRzRnS2lCVmMyVWdhVzUyWVhKcFlXNTBLQ2tnZEc4Z1lYTnpaWEowSUhOMFlYUmxJSGRvYVdOb0lIbHZkWElnY0hKdlozSmhiU0JoYzNOMWJXVnpJSFJ2SUdKbElIUnlkV1V1WEc0Z0tseHVJQ29nVUhKdmRtbGtaU0J6Y0hKcGJuUm1MWE4wZVd4bElHWnZjbTFoZENBb2IyNXNlU0FsY3lCcGN5QnpkWEJ3YjNKMFpXUXBJR0Z1WkNCaGNtZDFiV1Z1ZEhOY2JpQXFJSFJ2SUhCeWIzWnBaR1VnYVc1bWIzSnRZWFJwYjI0Z1lXSnZkWFFnZDJoaGRDQmljbTlyWlNCaGJtUWdkMmhoZENCNWIzVWdkMlZ5WlZ4dUlDb2daWGh3WldOMGFXNW5MbHh1SUNwY2JpQXFJRlJvWlNCcGJuWmhjbWxoYm5RZ2JXVnpjMkZuWlNCM2FXeHNJR0psSUhOMGNtbHdjR1ZrSUdsdUlIQnliMlIxWTNScGIyNHNJR0oxZENCMGFHVWdhVzUyWVhKcFlXNTBYRzRnS2lCM2FXeHNJSEpsYldGcGJpQjBieUJsYm5OMWNtVWdiRzluYVdNZ1pHOWxjeUJ1YjNRZ1pHbG1abVZ5SUdsdUlIQnliMlIxWTNScGIyNHVYRzRnS2k5Y2JseHVkbUZ5SUdsdWRtRnlhV0Z1ZENBOUlHWjFibU4wYVc5dUtHTnZibVJwZEdsdmJpd2dabTl5YldGMExDQmhMQ0JpTENCakxDQmtMQ0JsTENCbUtTQjdYRzRnSUdsbUlDaGNJbkJ5YjJSMVkzUnBiMjVjSWlBaFBUMGdjSEp2WTJWemN5NWxibll1VGs5RVJWOUZUbFlwSUh0Y2JpQWdJQ0JwWmlBb1ptOXliV0YwSUQwOVBTQjFibVJsWm1sdVpXUXBJSHRjYmlBZ0lDQWdJSFJvY205M0lHNWxkeUJGY25KdmNpZ25hVzUyWVhKcFlXNTBJSEpsY1hWcGNtVnpJR0Z1SUdWeWNtOXlJRzFsYzNOaFoyVWdZWEpuZFcxbGJuUW5LVHRjYmlBZ0lDQjlYRzRnSUgxY2JseHVJQ0JwWmlBb0lXTnZibVJwZEdsdmJpa2dlMXh1SUNBZ0lIWmhjaUJsY25KdmNqdGNiaUFnSUNCcFppQW9abTl5YldGMElEMDlQU0IxYm1SbFptbHVaV1FwSUh0Y2JpQWdJQ0FnSUdWeWNtOXlJRDBnYm1WM0lFVnljbTl5S0Z4dUlDQWdJQ0FnSUNBblRXbHVhV1pwWldRZ1pYaGpaWEIwYVc5dUlHOWpZM1Z5Y21Wa095QjFjMlVnZEdobElHNXZiaTF0YVc1cFptbGxaQ0JrWlhZZ1pXNTJhWEp2Ym0xbGJuUWdKeUFyWEc0Z0lDQWdJQ0FnSUNkbWIzSWdkR2hsSUdaMWJHd2daWEp5YjNJZ2JXVnpjMkZuWlNCaGJtUWdZV1JrYVhScGIyNWhiQ0JvWld4d1puVnNJSGRoY201cGJtZHpMaWRjYmlBZ0lDQWdJQ2s3WEc0Z0lDQWdmU0JsYkhObElIdGNiaUFnSUNBZ0lIWmhjaUJoY21keklEMGdXMkVzSUdJc0lHTXNJR1FzSUdVc0lHWmRPMXh1SUNBZ0lDQWdkbUZ5SUdGeVowbHVaR1Y0SUQwZ01EdGNiaUFnSUNBZ0lHVnljbTl5SUQwZ2JtVjNJRVZ5Y205eUtGeHVJQ0FnSUNBZ0lDQW5TVzUyWVhKcFlXNTBJRlpwYjJ4aGRHbHZiam9nSnlBclhHNGdJQ0FnSUNBZ0lHWnZjbTFoZEM1eVpYQnNZV05sS0M4bGN5OW5MQ0JtZFc1amRHbHZiaWdwSUhzZ2NtVjBkWEp1SUdGeVozTmJZWEpuU1c1a1pYZ3JLMTA3SUgwcFhHNGdJQ0FnSUNBcE8xeHVJQ0FnSUgxY2JseHVJQ0FnSUdWeWNtOXlMbVp5WVcxbGMxUnZVRzl3SUQwZ01Uc2dMeThnZDJVZ1pHOXVKM1FnWTJGeVpTQmhZbTkxZENCcGJuWmhjbWxoYm5RbmN5QnZkMjRnWm5KaGJXVmNiaUFnSUNCMGFISnZkeUJsY25KdmNqdGNiaUFnZlZ4dWZUdGNibHh1Ylc5a2RXeGxMbVY0Y0c5eWRITWdQU0JwYm5aaGNtbGhiblE3WEc0aVhYMD0iLCIvKipcbiAqIENvcHlyaWdodCAyMDEzLTIwMTQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEJTRC1zdHlsZSBsaWNlbnNlIGZvdW5kIGluIHRoZVxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLiBBbiBhZGRpdGlvbmFsIGdyYW50XG4gKiBvZiBwYXRlbnQgcmlnaHRzIGNhbiBiZSBmb3VuZCBpbiB0aGUgUEFURU5UUyBmaWxlIGluIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAqXG4gKiBAcHJvdmlkZXNNb2R1bGUga2V5T2ZcbiAqL1xuXG4vKipcbiAqIEFsbG93cyBleHRyYWN0aW9uIG9mIGEgbWluaWZpZWQga2V5LiBMZXQncyB0aGUgYnVpbGQgc3lzdGVtIG1pbmlmeSBrZXlzXG4gKiB3aXRob3V0IGxvb3NpbmcgdGhlIGFiaWxpdHkgdG8gZHluYW1pY2FsbHkgdXNlIGtleSBzdHJpbmdzIGFzIHZhbHVlc1xuICogdGhlbXNlbHZlcy4gUGFzcyBpbiBhbiBvYmplY3Qgd2l0aCBhIHNpbmdsZSBrZXkvdmFsIHBhaXIgYW5kIGl0IHdpbGwgcmV0dXJuXG4gKiB5b3UgdGhlIHN0cmluZyBrZXkgb2YgdGhhdCBzaW5nbGUgcmVjb3JkLiBTdXBwb3NlIHlvdSB3YW50IHRvIGdyYWIgdGhlXG4gKiB2YWx1ZSBmb3IgYSBrZXkgJ2NsYXNzTmFtZScgaW5zaWRlIG9mIGFuIG9iamVjdC4gS2V5L3ZhbCBtaW5pZmljYXRpb24gbWF5XG4gKiBoYXZlIGFsaWFzZWQgdGhhdCBrZXkgdG8gYmUgJ3hhMTInLiBrZXlPZih7Y2xhc3NOYW1lOiBudWxsfSkgd2lsbCByZXR1cm5cbiAqICd4YTEyJyBpbiB0aGF0IGNhc2UuIFJlc29sdmUga2V5cyB5b3Ugd2FudCB0byB1c2Ugb25jZSBhdCBzdGFydHVwIHRpbWUsIHRoZW5cbiAqIHJldXNlIHRob3NlIHJlc29sdXRpb25zLlxuICovXG52YXIga2V5T2YgPSBmdW5jdGlvbihvbmVLZXlPYmopIHtcbiAgdmFyIGtleTtcbiAgZm9yIChrZXkgaW4gb25lS2V5T2JqKSB7XG4gICAgaWYgKCFvbmVLZXlPYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIHJldHVybiBrZXk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0ga2V5T2Y7XG4iLCIoZnVuY3Rpb24gKHByb2Nlc3Mpe1xuLyoqXG4gKiBDb3B5cmlnaHQgMjAxMy0yMDE0LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBCU0Qtc3R5bGUgbGljZW5zZSBmb3VuZCBpbiB0aGVcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS4gQW4gYWRkaXRpb25hbCBncmFudFxuICogb2YgcGF0ZW50IHJpZ2h0cyBjYW4gYmUgZm91bmQgaW4gdGhlIFBBVEVOVFMgZmlsZSBpbiB0aGUgc2FtZSBkaXJlY3RvcnkuXG4gKlxuICogQHByb3ZpZGVzTW9kdWxlIHVwZGF0ZVxuICovXG5cblwidXNlIHN0cmljdFwiO1xuXG52YXIgYXNzaWduID0gcmVxdWlyZShcIi4vT2JqZWN0LmFzc2lnblwiKTtcbnZhciBrZXlPZiA9IHJlcXVpcmUoXCIuL2tleU9mXCIpO1xudmFyIGludmFyaWFudCA9IHJlcXVpcmUoXCIuL2ludmFyaWFudFwiKTtcblxuZnVuY3Rpb24gc2hhbGxvd0NvcHkoeCkge1xuICBpZiAoQXJyYXkuaXNBcnJheSh4KSkge1xuICAgIHJldHVybiB4LmNvbmNhdCgpO1xuICB9IGVsc2UgaWYgKHggJiYgdHlwZW9mIHggPT09ICdvYmplY3QnKSB7XG4gICAgcmV0dXJuIGFzc2lnbihuZXcgeC5jb25zdHJ1Y3RvcigpLCB4KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4geDtcbiAgfVxufVxuXG52YXIgQ09NTUFORF9QVVNIID0ga2V5T2YoeyRwdXNoOiBudWxsfSk7XG52YXIgQ09NTUFORF9VTlNISUZUID0ga2V5T2YoeyR1bnNoaWZ0OiBudWxsfSk7XG52YXIgQ09NTUFORF9TUExJQ0UgPSBrZXlPZih7JHNwbGljZTogbnVsbH0pO1xudmFyIENPTU1BTkRfU0VUID0ga2V5T2YoeyRzZXQ6IG51bGx9KTtcbnZhciBDT01NQU5EX01FUkdFID0ga2V5T2YoeyRtZXJnZTogbnVsbH0pO1xudmFyIENPTU1BTkRfQVBQTFkgPSBrZXlPZih7JGFwcGx5OiBudWxsfSk7XG5cbnZhciBBTExfQ09NTUFORFNfTElTVCA9IFtcbiAgQ09NTUFORF9QVVNILFxuICBDT01NQU5EX1VOU0hJRlQsXG4gIENPTU1BTkRfU1BMSUNFLFxuICBDT01NQU5EX1NFVCxcbiAgQ09NTUFORF9NRVJHRSxcbiAgQ09NTUFORF9BUFBMWVxuXTtcblxudmFyIEFMTF9DT01NQU5EU19TRVQgPSB7fTtcblxuQUxMX0NPTU1BTkRTX0xJU1QuZm9yRWFjaChmdW5jdGlvbihjb21tYW5kKSB7XG4gIEFMTF9DT01NQU5EU19TRVRbY29tbWFuZF0gPSB0cnVlO1xufSk7XG5cbmZ1bmN0aW9uIGludmFyaWFudEFycmF5Q2FzZSh2YWx1ZSwgc3BlYywgY29tbWFuZCkge1xuICAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WID8gaW52YXJpYW50KFxuICAgIEFycmF5LmlzQXJyYXkodmFsdWUpLFxuICAgICd1cGRhdGUoKTogZXhwZWN0ZWQgdGFyZ2V0IG9mICVzIHRvIGJlIGFuIGFycmF5OyBnb3QgJXMuJyxcbiAgICBjb21tYW5kLFxuICAgIHZhbHVlXG4gICkgOiBpbnZhcmlhbnQoQXJyYXkuaXNBcnJheSh2YWx1ZSkpKTtcbiAgdmFyIHNwZWNWYWx1ZSA9IHNwZWNbY29tbWFuZF07XG4gIChcInByb2R1Y3Rpb25cIiAhPT0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPyBpbnZhcmlhbnQoXG4gICAgQXJyYXkuaXNBcnJheShzcGVjVmFsdWUpLFxuICAgICd1cGRhdGUoKTogZXhwZWN0ZWQgc3BlYyBvZiAlcyB0byBiZSBhbiBhcnJheTsgZ290ICVzLiAnICtcbiAgICAnRGlkIHlvdSBmb3JnZXQgdG8gd3JhcCB5b3VyIHBhcmFtZXRlciBpbiBhbiBhcnJheT8nLFxuICAgIGNvbW1hbmQsXG4gICAgc3BlY1ZhbHVlXG4gICkgOiBpbnZhcmlhbnQoQXJyYXkuaXNBcnJheShzcGVjVmFsdWUpKSk7XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZSh2YWx1ZSwgc3BlYykge1xuICAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WID8gaW52YXJpYW50KFxuICAgIHR5cGVvZiBzcGVjID09PSAnb2JqZWN0JyxcbiAgICAndXBkYXRlKCk6IFlvdSBwcm92aWRlZCBhIGtleSBwYXRoIHRvIHVwZGF0ZSgpIHRoYXQgZGlkIG5vdCBjb250YWluIG9uZSAnICtcbiAgICAnb2YgJXMuIERpZCB5b3UgZm9yZ2V0IHRvIGluY2x1ZGUgeyVzOiAuLi59PycsXG4gICAgQUxMX0NPTU1BTkRTX0xJU1Quam9pbignLCAnKSxcbiAgICBDT01NQU5EX1NFVFxuICApIDogaW52YXJpYW50KHR5cGVvZiBzcGVjID09PSAnb2JqZWN0JykpO1xuXG4gIGlmIChzcGVjLmhhc093blByb3BlcnR5KENPTU1BTkRfU0VUKSkge1xuICAgIChcInByb2R1Y3Rpb25cIiAhPT0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPyBpbnZhcmlhbnQoXG4gICAgICBPYmplY3Qua2V5cyhzcGVjKS5sZW5ndGggPT09IDEsXG4gICAgICAnQ2Fubm90IGhhdmUgbW9yZSB0aGFuIG9uZSBrZXkgaW4gYW4gb2JqZWN0IHdpdGggJXMnLFxuICAgICAgQ09NTUFORF9TRVRcbiAgICApIDogaW52YXJpYW50KE9iamVjdC5rZXlzKHNwZWMpLmxlbmd0aCA9PT0gMSkpO1xuXG4gICAgcmV0dXJuIHNwZWNbQ09NTUFORF9TRVRdO1xuICB9XG5cbiAgdmFyIG5leHRWYWx1ZSA9IHNoYWxsb3dDb3B5KHZhbHVlKTtcblxuICBpZiAoc3BlYy5oYXNPd25Qcm9wZXJ0eShDT01NQU5EX01FUkdFKSkge1xuICAgIHZhciBtZXJnZU9iaiA9IHNwZWNbQ09NTUFORF9NRVJHRV07XG4gICAgKFwicHJvZHVjdGlvblwiICE9PSBwcm9jZXNzLmVudi5OT0RFX0VOViA/IGludmFyaWFudChcbiAgICAgIG1lcmdlT2JqICYmIHR5cGVvZiBtZXJnZU9iaiA9PT0gJ29iamVjdCcsXG4gICAgICAndXBkYXRlKCk6ICVzIGV4cGVjdHMgYSBzcGVjIG9mIHR5cGUgXFwnb2JqZWN0XFwnOyBnb3QgJXMnLFxuICAgICAgQ09NTUFORF9NRVJHRSxcbiAgICAgIG1lcmdlT2JqXG4gICAgKSA6IGludmFyaWFudChtZXJnZU9iaiAmJiB0eXBlb2YgbWVyZ2VPYmogPT09ICdvYmplY3QnKSk7XG4gICAgKFwicHJvZHVjdGlvblwiICE9PSBwcm9jZXNzLmVudi5OT0RFX0VOViA/IGludmFyaWFudChcbiAgICAgIG5leHRWYWx1ZSAmJiB0eXBlb2YgbmV4dFZhbHVlID09PSAnb2JqZWN0JyxcbiAgICAgICd1cGRhdGUoKTogJXMgZXhwZWN0cyBhIHRhcmdldCBvZiB0eXBlIFxcJ29iamVjdFxcJzsgZ290ICVzJyxcbiAgICAgIENPTU1BTkRfTUVSR0UsXG4gICAgICBuZXh0VmFsdWVcbiAgICApIDogaW52YXJpYW50KG5leHRWYWx1ZSAmJiB0eXBlb2YgbmV4dFZhbHVlID09PSAnb2JqZWN0JykpO1xuICAgIGFzc2lnbihuZXh0VmFsdWUsIHNwZWNbQ09NTUFORF9NRVJHRV0pO1xuICB9XG5cbiAgaWYgKHNwZWMuaGFzT3duUHJvcGVydHkoQ09NTUFORF9QVVNIKSkge1xuICAgIGludmFyaWFudEFycmF5Q2FzZSh2YWx1ZSwgc3BlYywgQ09NTUFORF9QVVNIKTtcbiAgICBzcGVjW0NPTU1BTkRfUFVTSF0uZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICBuZXh0VmFsdWUucHVzaChpdGVtKTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmIChzcGVjLmhhc093blByb3BlcnR5KENPTU1BTkRfVU5TSElGVCkpIHtcbiAgICBpbnZhcmlhbnRBcnJheUNhc2UodmFsdWUsIHNwZWMsIENPTU1BTkRfVU5TSElGVCk7XG4gICAgc3BlY1tDT01NQU5EX1VOU0hJRlRdLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgbmV4dFZhbHVlLnVuc2hpZnQoaXRlbSk7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoc3BlYy5oYXNPd25Qcm9wZXJ0eShDT01NQU5EX1NQTElDRSkpIHtcbiAgICAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WID8gaW52YXJpYW50KFxuICAgICAgQXJyYXkuaXNBcnJheSh2YWx1ZSksXG4gICAgICAnRXhwZWN0ZWQgJXMgdGFyZ2V0IHRvIGJlIGFuIGFycmF5OyBnb3QgJXMnLFxuICAgICAgQ09NTUFORF9TUExJQ0UsXG4gICAgICB2YWx1ZVxuICAgICkgOiBpbnZhcmlhbnQoQXJyYXkuaXNBcnJheSh2YWx1ZSkpKTtcbiAgICAoXCJwcm9kdWN0aW9uXCIgIT09IHByb2Nlc3MuZW52Lk5PREVfRU5WID8gaW52YXJpYW50KFxuICAgICAgQXJyYXkuaXNBcnJheShzcGVjW0NPTU1BTkRfU1BMSUNFXSksXG4gICAgICAndXBkYXRlKCk6IGV4cGVjdGVkIHNwZWMgb2YgJXMgdG8gYmUgYW4gYXJyYXkgb2YgYXJyYXlzOyBnb3QgJXMuICcgK1xuICAgICAgJ0RpZCB5b3UgZm9yZ2V0IHRvIHdyYXAgeW91ciBwYXJhbWV0ZXJzIGluIGFuIGFycmF5PycsXG4gICAgICBDT01NQU5EX1NQTElDRSxcbiAgICAgIHNwZWNbQ09NTUFORF9TUExJQ0VdXG4gICAgKSA6IGludmFyaWFudChBcnJheS5pc0FycmF5KHNwZWNbQ09NTUFORF9TUExJQ0VdKSkpO1xuICAgIHNwZWNbQ09NTUFORF9TUExJQ0VdLmZvckVhY2goZnVuY3Rpb24oYXJncykge1xuICAgICAgKFwicHJvZHVjdGlvblwiICE9PSBwcm9jZXNzLmVudi5OT0RFX0VOViA/IGludmFyaWFudChcbiAgICAgICAgQXJyYXkuaXNBcnJheShhcmdzKSxcbiAgICAgICAgJ3VwZGF0ZSgpOiBleHBlY3RlZCBzcGVjIG9mICVzIHRvIGJlIGFuIGFycmF5IG9mIGFycmF5czsgZ290ICVzLiAnICtcbiAgICAgICAgJ0RpZCB5b3UgZm9yZ2V0IHRvIHdyYXAgeW91ciBwYXJhbWV0ZXJzIGluIGFuIGFycmF5PycsXG4gICAgICAgIENPTU1BTkRfU1BMSUNFLFxuICAgICAgICBzcGVjW0NPTU1BTkRfU1BMSUNFXVxuICAgICAgKSA6IGludmFyaWFudChBcnJheS5pc0FycmF5KGFyZ3MpKSk7XG4gICAgICBuZXh0VmFsdWUuc3BsaWNlLmFwcGx5KG5leHRWYWx1ZSwgYXJncyk7XG4gICAgfSk7XG4gIH1cblxuICBpZiAoc3BlYy5oYXNPd25Qcm9wZXJ0eShDT01NQU5EX0FQUExZKSkge1xuICAgIChcInByb2R1Y3Rpb25cIiAhPT0gcHJvY2Vzcy5lbnYuTk9ERV9FTlYgPyBpbnZhcmlhbnQoXG4gICAgICB0eXBlb2Ygc3BlY1tDT01NQU5EX0FQUExZXSA9PT0gJ2Z1bmN0aW9uJyxcbiAgICAgICd1cGRhdGUoKTogZXhwZWN0ZWQgc3BlYyBvZiAlcyB0byBiZSBhIGZ1bmN0aW9uOyBnb3QgJXMuJyxcbiAgICAgIENPTU1BTkRfQVBQTFksXG4gICAgICBzcGVjW0NPTU1BTkRfQVBQTFldXG4gICAgKSA6IGludmFyaWFudCh0eXBlb2Ygc3BlY1tDT01NQU5EX0FQUExZXSA9PT0gJ2Z1bmN0aW9uJykpO1xuICAgIG5leHRWYWx1ZSA9IHNwZWNbQ09NTUFORF9BUFBMWV0obmV4dFZhbHVlKTtcbiAgfVxuXG4gIGZvciAodmFyIGsgaW4gc3BlYykge1xuICAgIGlmICghKEFMTF9DT01NQU5EU19TRVQuaGFzT3duUHJvcGVydHkoaykgJiYgQUxMX0NPTU1BTkRTX1NFVFtrXSkpIHtcbiAgICAgIG5leHRWYWx1ZVtrXSA9IHVwZGF0ZSh2YWx1ZVtrXSwgc3BlY1trXSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG5leHRWYWx1ZTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSB1cGRhdGU7XG5cbn0pLmNhbGwodGhpcyxyZXF1aXJlKCdfcHJvY2VzcycpKVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2NoYXJzZXQ6dXRmLTg7YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0p6YjNWeVkyVnpJanBiSW01dlpHVmZiVzlrZFd4bGN5OXlaV0ZqZEM5c2FXSXZkWEJrWVhSbExtcHpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdRVUZCUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFN1FVRkRRVHRCUVVOQk8wRkJRMEU3UVVGRFFUdEJRVU5CTzBGQlEwRTdRVUZEUVR0QlFVTkJPMEZCUTBFaUxDSm1hV3hsSWpvaVoyVnVaWEpoZEdWa0xtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTkRiMjUwWlc1MElqcGJJaThxS2x4dUlDb2dRMjl3ZVhKcFoyaDBJREl3TVRNdE1qQXhOQ3dnUm1GalpXSnZiMnNzSUVsdVl5NWNiaUFxSUVGc2JDQnlhV2RvZEhNZ2NtVnpaWEoyWldRdVhHNGdLbHh1SUNvZ1ZHaHBjeUJ6YjNWeVkyVWdZMjlrWlNCcGN5QnNhV05sYm5ObFpDQjFibVJsY2lCMGFHVWdRbE5FTFhOMGVXeGxJR3hwWTJWdWMyVWdabTkxYm1RZ2FXNGdkR2hsWEc0Z0tpQk1TVU5GVGxORklHWnBiR1VnYVc0Z2RHaGxJSEp2YjNRZ1pHbHlaV04wYjNKNUlHOW1JSFJvYVhNZ2MyOTFjbU5sSUhSeVpXVXVJRUZ1SUdGa1pHbDBhVzl1WVd3Z1ozSmhiblJjYmlBcUlHOW1JSEJoZEdWdWRDQnlhV2RvZEhNZ1kyRnVJR0psSUdadmRXNWtJR2x1SUhSb1pTQlFRVlJGVGxSVElHWnBiR1VnYVc0Z2RHaGxJSE5oYldVZ1pHbHlaV04wYjNKNUxseHVJQ3BjYmlBcUlFQndjbTkyYVdSbGMwMXZaSFZzWlNCMWNHUmhkR1ZjYmlBcUwxeHVYRzVjSW5WelpTQnpkSEpwWTNSY0lqdGNibHh1ZG1GeUlHRnpjMmxuYmlBOUlISmxjWFZwY21Vb1hDSXVMMDlpYW1WamRDNWhjM05wWjI1Y0lpazdYRzUyWVhJZ2EyVjVUMllnUFNCeVpYRjFhWEpsS0Z3aUxpOXJaWGxQWmx3aUtUdGNiblpoY2lCcGJuWmhjbWxoYm5RZ1BTQnlaWEYxYVhKbEtGd2lMaTlwYm5aaGNtbGhiblJjSWlrN1hHNWNibVoxYm1OMGFXOXVJSE5vWVd4c2IzZERiM0I1S0hncElIdGNiaUFnYVdZZ0tFRnljbUY1TG1selFYSnlZWGtvZUNrcElIdGNiaUFnSUNCeVpYUjFjbTRnZUM1amIyNWpZWFFvS1R0Y2JpQWdmU0JsYkhObElHbG1JQ2g0SUNZbUlIUjVjR1Z2WmlCNElEMDlQU0FuYjJKcVpXTjBKeWtnZTF4dUlDQWdJSEpsZEhWeWJpQmhjM05wWjI0b2JtVjNJSGd1WTI5dWMzUnlkV04wYjNJb0tTd2dlQ2s3WEc0Z0lIMGdaV3h6WlNCN1hHNGdJQ0FnY21WMGRYSnVJSGc3WEc0Z0lIMWNibjFjYmx4dWRtRnlJRU5QVFUxQlRrUmZVRlZUU0NBOUlHdGxlVTltS0hza2NIVnphRG9nYm5Wc2JIMHBPMXh1ZG1GeUlFTlBUVTFCVGtSZlZVNVRTRWxHVkNBOUlHdGxlVTltS0hza2RXNXphR2xtZERvZ2JuVnNiSDBwTzF4dWRtRnlJRU5QVFUxQlRrUmZVMUJNU1VORklEMGdhMlY1VDJZb2V5UnpjR3hwWTJVNklHNTFiR3g5S1R0Y2JuWmhjaUJEVDAxTlFVNUVYMU5GVkNBOUlHdGxlVTltS0hza2MyVjBPaUJ1ZFd4c2ZTazdYRzUyWVhJZ1EwOU5UVUZPUkY5TlJWSkhSU0E5SUd0bGVVOW1LSHNrYldWeVoyVTZJRzUxYkd4OUtUdGNiblpoY2lCRFQwMU5RVTVFWDBGUVVFeFpJRDBnYTJWNVQyWW9leVJoY0hCc2VUb2diblZzYkgwcE8xeHVYRzUyWVhJZ1FVeE1YME5QVFUxQlRrUlRYMHhKVTFRZ1BTQmJYRzRnSUVOUFRVMUJUa1JmVUZWVFNDeGNiaUFnUTA5TlRVRk9SRjlWVGxOSVNVWlVMRnh1SUNCRFQwMU5RVTVFWDFOUVRFbERSU3hjYmlBZ1EwOU5UVUZPUkY5VFJWUXNYRzRnSUVOUFRVMUJUa1JmVFVWU1IwVXNYRzRnSUVOUFRVMUJUa1JmUVZCUVRGbGNibDA3WEc1Y2JuWmhjaUJCVEV4ZlEwOU5UVUZPUkZOZlUwVlVJRDBnZTMwN1hHNWNia0ZNVEY5RFQwMU5RVTVFVTE5TVNWTlVMbVp2Y2tWaFkyZ29ablZ1WTNScGIyNG9ZMjl0YldGdVpDa2dlMXh1SUNCQlRFeGZRMDlOVFVGT1JGTmZVMFZVVzJOdmJXMWhibVJkSUQwZ2RISjFaVHRjYm4wcE8xeHVYRzVtZFc1amRHbHZiaUJwYm5aaGNtbGhiblJCY25KaGVVTmhjMlVvZG1Gc2RXVXNJSE53WldNc0lHTnZiVzFoYm1RcElIdGNiaUFnS0Z3aWNISnZaSFZqZEdsdmJsd2lJQ0U5UFNCd2NtOWpaWE56TG1WdWRpNU9UMFJGWDBWT1ZpQS9JR2x1ZG1GeWFXRnVkQ2hjYmlBZ0lDQkJjbkpoZVM1cGMwRnljbUY1S0haaGJIVmxLU3hjYmlBZ0lDQW5kWEJrWVhSbEtDazZJR1Y0Y0dWamRHVmtJSFJoY21kbGRDQnZaaUFsY3lCMGJ5QmlaU0JoYmlCaGNuSmhlVHNnWjI5MElDVnpMaWNzWEc0Z0lDQWdZMjl0YldGdVpDeGNiaUFnSUNCMllXeDFaVnh1SUNBcElEb2dhVzUyWVhKcFlXNTBLRUZ5Y21GNUxtbHpRWEp5WVhrb2RtRnNkV1VwS1NrN1hHNGdJSFpoY2lCemNHVmpWbUZzZFdVZ1BTQnpjR1ZqVzJOdmJXMWhibVJkTzF4dUlDQW9YQ0p3Y205a2RXTjBhVzl1WENJZ0lUMDlJSEJ5YjJObGMzTXVaVzUyTGs1UFJFVmZSVTVXSUQ4Z2FXNTJZWEpwWVc1MEtGeHVJQ0FnSUVGeWNtRjVMbWx6UVhKeVlYa29jM0JsWTFaaGJIVmxLU3hjYmlBZ0lDQW5kWEJrWVhSbEtDazZJR1Y0Y0dWamRHVmtJSE53WldNZ2IyWWdKWE1nZEc4Z1ltVWdZVzRnWVhKeVlYazdJR2R2ZENBbGN5NGdKeUFyWEc0Z0lDQWdKMFJwWkNCNWIzVWdabTl5WjJWMElIUnZJSGR5WVhBZ2VXOTFjaUJ3WVhKaGJXVjBaWElnYVc0Z1lXNGdZWEp5WVhrL0p5eGNiaUFnSUNCamIyMXRZVzVrTEZ4dUlDQWdJSE53WldOV1lXeDFaVnh1SUNBcElEb2dhVzUyWVhKcFlXNTBLRUZ5Y21GNUxtbHpRWEp5WVhrb2MzQmxZMVpoYkhWbEtTa3BPMXh1ZlZ4dVhHNW1kVzVqZEdsdmJpQjFjR1JoZEdVb2RtRnNkV1VzSUhOd1pXTXBJSHRjYmlBZ0tGd2ljSEp2WkhWamRHbHZibHdpSUNFOVBTQndjbTlqWlhOekxtVnVkaTVPVDBSRlgwVk9WaUEvSUdsdWRtRnlhV0Z1ZENoY2JpQWdJQ0IwZVhCbGIyWWdjM0JsWXlBOVBUMGdKMjlpYW1WamRDY3NYRzRnSUNBZ0ozVndaR0YwWlNncE9pQlpiM1VnY0hKdmRtbGtaV1FnWVNCclpYa2djR0YwYUNCMGJ5QjFjR1JoZEdVb0tTQjBhR0YwSUdScFpDQnViM1FnWTI5dWRHRnBiaUJ2Ym1VZ0p5QXJYRzRnSUNBZ0oyOW1JQ1Z6TGlCRWFXUWdlVzkxSUdadmNtZGxkQ0IwYnlCcGJtTnNkV1JsSUhzbGN6b2dMaTR1ZlQ4bkxGeHVJQ0FnSUVGTVRGOURUMDFOUVU1RVUxOU1TVk5VTG1wdmFXNG9KeXdnSnlrc1hHNGdJQ0FnUTA5TlRVRk9SRjlUUlZSY2JpQWdLU0E2SUdsdWRtRnlhV0Z1ZENoMGVYQmxiMllnYzNCbFl5QTlQVDBnSjI5aWFtVmpkQ2NwS1R0Y2JseHVJQ0JwWmlBb2MzQmxZeTVvWVhOUGQyNVFjbTl3WlhKMGVTaERUMDFOUVU1RVgxTkZWQ2twSUh0Y2JpQWdJQ0FvWENKd2NtOWtkV04wYVc5dVhDSWdJVDA5SUhCeWIyTmxjM011Wlc1MkxrNVBSRVZmUlU1V0lEOGdhVzUyWVhKcFlXNTBLRnh1SUNBZ0lDQWdUMkpxWldOMExtdGxlWE1vYzNCbFl5a3ViR1Z1WjNSb0lEMDlQU0F4TEZ4dUlDQWdJQ0FnSjBOaGJtNXZkQ0JvWVhabElHMXZjbVVnZEdoaGJpQnZibVVnYTJWNUlHbHVJR0Z1SUc5aWFtVmpkQ0IzYVhSb0lDVnpKeXhjYmlBZ0lDQWdJRU5QVFUxQlRrUmZVMFZVWEc0Z0lDQWdLU0E2SUdsdWRtRnlhV0Z1ZENoUFltcGxZM1F1YTJWNWN5aHpjR1ZqS1M1c1pXNW5kR2dnUFQwOUlERXBLVHRjYmx4dUlDQWdJSEpsZEhWeWJpQnpjR1ZqVzBOUFRVMUJUa1JmVTBWVVhUdGNiaUFnZlZ4dVhHNGdJSFpoY2lCdVpYaDBWbUZzZFdVZ1BTQnphR0ZzYkc5M1EyOXdlU2gyWVd4MVpTazdYRzVjYmlBZ2FXWWdLSE53WldNdWFHRnpUM2R1VUhKdmNHVnlkSGtvUTA5TlRVRk9SRjlOUlZKSFJTa3BJSHRjYmlBZ0lDQjJZWElnYldWeVoyVlBZbW9nUFNCemNHVmpXME5QVFUxQlRrUmZUVVZTUjBWZE8xeHVJQ0FnSUNoY0luQnliMlIxWTNScGIyNWNJaUFoUFQwZ2NISnZZMlZ6Y3k1bGJuWXVUazlFUlY5RlRsWWdQeUJwYm5aaGNtbGhiblFvWEc0Z0lDQWdJQ0J0WlhKblpVOWlhaUFtSmlCMGVYQmxiMllnYldWeVoyVlBZbW9nUFQwOUlDZHZZbXBsWTNRbkxGeHVJQ0FnSUNBZ0ozVndaR0YwWlNncE9pQWxjeUJsZUhCbFkzUnpJR0VnYzNCbFl5QnZaaUIwZVhCbElGeGNKMjlpYW1WamRGeGNKenNnWjI5MElDVnpKeXhjYmlBZ0lDQWdJRU5QVFUxQlRrUmZUVVZTUjBVc1hHNGdJQ0FnSUNCdFpYSm5aVTlpYWx4dUlDQWdJQ2tnT2lCcGJuWmhjbWxoYm5Rb2JXVnlaMlZQWW1vZ0ppWWdkSGx3Wlc5bUlHMWxjbWRsVDJKcUlEMDlQU0FuYjJKcVpXTjBKeWtwTzF4dUlDQWdJQ2hjSW5CeWIyUjFZM1JwYjI1Y0lpQWhQVDBnY0hKdlkyVnpjeTVsYm5ZdVRrOUVSVjlGVGxZZ1B5QnBiblpoY21saGJuUW9YRzRnSUNBZ0lDQnVaWGgwVm1Gc2RXVWdKaVlnZEhsd1pXOW1JRzVsZUhSV1lXeDFaU0E5UFQwZ0oyOWlhbVZqZENjc1hHNGdJQ0FnSUNBbmRYQmtZWFJsS0NrNklDVnpJR1Y0Y0dWamRITWdZU0IwWVhKblpYUWdiMllnZEhsd1pTQmNYQ2R2WW1wbFkzUmNYQ2M3SUdkdmRDQWxjeWNzWEc0Z0lDQWdJQ0JEVDAxTlFVNUVYMDFGVWtkRkxGeHVJQ0FnSUNBZ2JtVjRkRlpoYkhWbFhHNGdJQ0FnS1NBNklHbHVkbUZ5YVdGdWRDaHVaWGgwVm1Gc2RXVWdKaVlnZEhsd1pXOW1JRzVsZUhSV1lXeDFaU0E5UFQwZ0oyOWlhbVZqZENjcEtUdGNiaUFnSUNCaGMzTnBaMjRvYm1WNGRGWmhiSFZsTENCemNHVmpXME5QVFUxQlRrUmZUVVZTUjBWZEtUdGNiaUFnZlZ4dVhHNGdJR2xtSUNoemNHVmpMbWhoYzA5M2JsQnliM0JsY25SNUtFTlBUVTFCVGtSZlVGVlRTQ2twSUh0Y2JpQWdJQ0JwYm5aaGNtbGhiblJCY25KaGVVTmhjMlVvZG1Gc2RXVXNJSE53WldNc0lFTlBUVTFCVGtSZlVGVlRTQ2s3WEc0Z0lDQWdjM0JsWTF0RFQwMU5RVTVFWDFCVlUwaGRMbVp2Y2tWaFkyZ29ablZ1WTNScGIyNG9hWFJsYlNrZ2UxeHVJQ0FnSUNBZ2JtVjRkRlpoYkhWbExuQjFjMmdvYVhSbGJTazdYRzRnSUNBZ2ZTazdYRzRnSUgxY2JseHVJQ0JwWmlBb2MzQmxZeTVvWVhOUGQyNVFjbTl3WlhKMGVTaERUMDFOUVU1RVgxVk9VMGhKUmxRcEtTQjdYRzRnSUNBZ2FXNTJZWEpwWVc1MFFYSnlZWGxEWVhObEtIWmhiSFZsTENCemNHVmpMQ0JEVDAxTlFVNUVYMVZPVTBoSlJsUXBPMXh1SUNBZ0lITndaV05iUTA5TlRVRk9SRjlWVGxOSVNVWlVYUzVtYjNKRllXTm9LR1oxYm1OMGFXOXVLR2wwWlcwcElIdGNiaUFnSUNBZ0lHNWxlSFJXWVd4MVpTNTFibk5vYVdaMEtHbDBaVzBwTzF4dUlDQWdJSDBwTzF4dUlDQjlYRzVjYmlBZ2FXWWdLSE53WldNdWFHRnpUM2R1VUhKdmNHVnlkSGtvUTA5TlRVRk9SRjlUVUV4SlEwVXBLU0I3WEc0Z0lDQWdLRndpY0hKdlpIVmpkR2x2Ymx3aUlDRTlQU0J3Y205alpYTnpMbVZ1ZGk1T1QwUkZYMFZPVmlBL0lHbHVkbUZ5YVdGdWRDaGNiaUFnSUNBZ0lFRnljbUY1TG1selFYSnlZWGtvZG1Gc2RXVXBMRnh1SUNBZ0lDQWdKMFY0Y0dWamRHVmtJQ1Z6SUhSaGNtZGxkQ0IwYnlCaVpTQmhiaUJoY25KaGVUc2daMjkwSUNWekp5eGNiaUFnSUNBZ0lFTlBUVTFCVGtSZlUxQk1TVU5GTEZ4dUlDQWdJQ0FnZG1Gc2RXVmNiaUFnSUNBcElEb2dhVzUyWVhKcFlXNTBLRUZ5Y21GNUxtbHpRWEp5WVhrb2RtRnNkV1VwS1NrN1hHNGdJQ0FnS0Z3aWNISnZaSFZqZEdsdmJsd2lJQ0U5UFNCd2NtOWpaWE56TG1WdWRpNU9UMFJGWDBWT1ZpQS9JR2x1ZG1GeWFXRnVkQ2hjYmlBZ0lDQWdJRUZ5Y21GNUxtbHpRWEp5WVhrb2MzQmxZMXREVDAxTlFVNUVYMU5RVEVsRFJWMHBMRnh1SUNBZ0lDQWdKM1Z3WkdGMFpTZ3BPaUJsZUhCbFkzUmxaQ0J6Y0dWaklHOW1JQ1Z6SUhSdklHSmxJR0Z1SUdGeWNtRjVJRzltSUdGeWNtRjVjenNnWjI5MElDVnpMaUFuSUN0Y2JpQWdJQ0FnSUNkRWFXUWdlVzkxSUdadmNtZGxkQ0IwYnlCM2NtRndJSGx2ZFhJZ2NHRnlZVzFsZEdWeWN5QnBiaUJoYmlCaGNuSmhlVDhuTEZ4dUlDQWdJQ0FnUTA5TlRVRk9SRjlUVUV4SlEwVXNYRzRnSUNBZ0lDQnpjR1ZqVzBOUFRVMUJUa1JmVTFCTVNVTkZYVnh1SUNBZ0lDa2dPaUJwYm5aaGNtbGhiblFvUVhKeVlYa3VhWE5CY25KaGVTaHpjR1ZqVzBOUFRVMUJUa1JmVTFCTVNVTkZYU2twS1R0Y2JpQWdJQ0J6Y0dWalcwTlBUVTFCVGtSZlUxQk1TVU5GWFM1bWIzSkZZV05vS0daMWJtTjBhVzl1S0dGeVozTXBJSHRjYmlBZ0lDQWdJQ2hjSW5CeWIyUjFZM1JwYjI1Y0lpQWhQVDBnY0hKdlkyVnpjeTVsYm5ZdVRrOUVSVjlGVGxZZ1B5QnBiblpoY21saGJuUW9YRzRnSUNBZ0lDQWdJRUZ5Y21GNUxtbHpRWEp5WVhrb1lYSm5jeWtzWEc0Z0lDQWdJQ0FnSUNkMWNHUmhkR1VvS1RvZ1pYaHdaV04wWldRZ2MzQmxZeUJ2WmlBbGN5QjBieUJpWlNCaGJpQmhjbkpoZVNCdlppQmhjbkpoZVhNN0lHZHZkQ0FsY3k0Z0p5QXJYRzRnSUNBZ0lDQWdJQ2RFYVdRZ2VXOTFJR1p2Y21kbGRDQjBieUIzY21Gd0lIbHZkWElnY0dGeVlXMWxkR1Z5Y3lCcGJpQmhiaUJoY25KaGVUOG5MRnh1SUNBZ0lDQWdJQ0JEVDAxTlFVNUVYMU5RVEVsRFJTeGNiaUFnSUNBZ0lDQWdjM0JsWTF0RFQwMU5RVTVFWDFOUVRFbERSVjFjYmlBZ0lDQWdJQ2tnT2lCcGJuWmhjbWxoYm5Rb1FYSnlZWGt1YVhOQmNuSmhlU2hoY21kektTa3BPMXh1SUNBZ0lDQWdibVY0ZEZaaGJIVmxMbk53YkdsalpTNWhjSEJzZVNodVpYaDBWbUZzZFdVc0lHRnlaM01wTzF4dUlDQWdJSDBwTzF4dUlDQjlYRzVjYmlBZ2FXWWdLSE53WldNdWFHRnpUM2R1VUhKdmNHVnlkSGtvUTA5TlRVRk9SRjlCVUZCTVdTa3BJSHRjYmlBZ0lDQW9YQ0p3Y205a2RXTjBhVzl1WENJZ0lUMDlJSEJ5YjJObGMzTXVaVzUyTGs1UFJFVmZSVTVXSUQ4Z2FXNTJZWEpwWVc1MEtGeHVJQ0FnSUNBZ2RIbHdaVzltSUhOd1pXTmJRMDlOVFVGT1JGOUJVRkJNV1YwZ1BUMDlJQ2RtZFc1amRHbHZiaWNzWEc0Z0lDQWdJQ0FuZFhCa1lYUmxLQ2s2SUdWNGNHVmpkR1ZrSUhOd1pXTWdiMllnSlhNZ2RHOGdZbVVnWVNCbWRXNWpkR2x2YmpzZ1oyOTBJQ1Z6TGljc1hHNGdJQ0FnSUNCRFQwMU5RVTVFWDBGUVVFeFpMRnh1SUNBZ0lDQWdjM0JsWTF0RFQwMU5RVTVFWDBGUVVFeFpYVnh1SUNBZ0lDa2dPaUJwYm5aaGNtbGhiblFvZEhsd1pXOW1JSE53WldOYlEwOU5UVUZPUkY5QlVGQk1XVjBnUFQwOUlDZG1kVzVqZEdsdmJpY3BLVHRjYmlBZ0lDQnVaWGgwVm1Gc2RXVWdQU0J6Y0dWalcwTlBUVTFCVGtSZlFWQlFURmxkS0c1bGVIUldZV3gxWlNrN1hHNGdJSDFjYmx4dUlDQm1iM0lnS0haaGNpQnJJR2x1SUhOd1pXTXBJSHRjYmlBZ0lDQnBaaUFvSVNoQlRFeGZRMDlOVFVGT1JGTmZVMFZVTG1oaGMwOTNibEJ5YjNCbGNuUjVLR3NwSUNZbUlFRk1URjlEVDAxTlFVNUVVMTlUUlZSYmExMHBLU0I3WEc0Z0lDQWdJQ0J1WlhoMFZtRnNkV1ZiYTEwZ1BTQjFjR1JoZEdVb2RtRnNkV1ZiYTEwc0lITndaV05iYTEwcE8xeHVJQ0FnSUgxY2JpQWdmVnh1WEc0Z0lISmxkSFZ5YmlCdVpYaDBWbUZzZFdVN1hHNTlYRzVjYm0xdlpIVnNaUzVsZUhCdmNuUnpJRDBnZFhCa1lYUmxPMXh1SWwxOSIsIid1c2Ugc3RyaWN0JztcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHF1ZXN0OiBmdW5jdGlvbiBxdWVzdCh1c2VyLCBfcXVlc3QpIHtcblx0XHR2YXIgcmVzdWx0ID0ge1xuXHRcdFx0dXNlcjoge1xuXHRcdFx0XHRpZDogdXNlci5pZCxcblx0XHRcdFx0bmFtZTogdXNlci5uYW1lXG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGlmIChfcXVlc3QpIHtcblx0XHRcdHJlc3VsdC5pZCA9IF9xdWVzdC5pZDtcblx0XHRcdHJlc3VsdC50aXRsZSA9IF9xdWVzdC50aXRsZTtcblx0XHRcdHJlc3VsdC5kZXNjcmlwdGlvbiA9IF9xdWVzdC5kZXNjcmlwdGlvbjtcblx0XHRcdHJlc3VsdC5kaXJ0eSA9IGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXN1bHQuaWQgPSBudWxsO1xuXHRcdFx0cmVzdWx0LnRpdGxlID0gJyc7XG5cdFx0XHRyZXN1bHQuZGVzY3JpcHRpb24gPSAnJztcblx0XHRcdHJlc3VsdC5kaXJ0eSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fVxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcyA9IHtcblx0bG9nOiBmdW5jdGlvbiBsb2codGV4dCkge1xuXHRcdGNvbnNvbGUubG9nKHRleHQpO1xuXHR9LFxuXHRnZXQ6IGZ1bmN0aW9uIGdldCh1cmwsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG5cdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuXHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0dmFyIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlID8gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpIDogbnVsbDtcblx0XHRcdFx0XHRjYWxsYmFjayh4aHIuc3RhdHVzLCByZXNwb25zZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoeGhyLnN0YXR1cyA9PT0gNDA0KSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignYWpheCBnZXQgZXJyb3InKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0eGhyLm9wZW4oJ0dFVCcsIHVybCk7XG5cdFx0eGhyLnNlbmQoKTtcblx0fSxcblx0cG9zdDogZnVuY3Rpb24gcG9zdCh1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG5cdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuXHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0dmFyIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlID8gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpIDogbnVsbDtcblx0XHRcdFx0XHRjYWxsYmFjayh4aHIuc3RhdHVzLCByZXNwb25zZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoeGhyLnN0YXR1cyA9PT0gNDA0KSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignYWpheCBwb3N0IGVycm9yJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdHhoci5vcGVuKCdQT1NUJywgdXJsKTtcblx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblx0XHR4aHIuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cdH0sXG5cdGNvb2tpZTogZnVuY3Rpb24gY29va2llKG5hbWUsIGNvb2tpZXMpIHtcblx0XHR2YXIgYyA9IHRoaXMuY29va2llcyhjb29raWVzKTtcblx0XHRyZXR1cm4gY1tuYW1lXTtcblx0fSxcblx0Y29va2llczogZnVuY3Rpb24gY29va2llcyhfY29va2llcykge1xuXHRcdHZhciBuYW1lVmFsdWVzID0gX2Nvb2tpZXMuc3BsaXQoJzsgJyk7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdG5hbWVWYWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIGkgPSBpdGVtLnNwbGl0KCc9Jyk7XG5cdFx0XHRyZXN1bHRbaVswXV0gPSBpWzFdO1xuXHRcdH0pO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdGdldFF1ZXJ5VmFsdWU6IGZ1bmN0aW9uIGdldFF1ZXJ5VmFsdWUocXVlcnlTdHJpbmcsIG5hbWUpIHtcblx0XHR2YXIgYXJyID0gcXVlcnlTdHJpbmcubWF0Y2gobmV3IFJlZ0V4cChuYW1lICsgJz0oW14mXSspJykpO1xuXG5cdFx0aWYgKGFycikge1xuXHRcdFx0cmV0dXJuIGFyclsxXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgdGVzdHMgPSBbe1xuXHRpZDogMSxcblx0dGVzdDogZnVuY3Rpb24gdGVzdCgpIHtcblx0XHR2YXIgY29va2llcyA9IHtcblx0XHRcdGNzYXRpOiAnbWFqb20nLFxuXHRcdFx0b25lOiAndHdvJ1xuXHRcdH07XG5cblx0XHR2YXIgcmVzdWx0ID0gdHJ1ZTtcblxuXHRcdHZhciBjID0gY3MuY29va2llcygnY3NhdGk9bWFqb207IG9uZT10d28nKTtcblxuXHRcdGlmIChjLmNzYXRpICE9PSBjb29raWVzLmNzYXRpKSByZXN1bHQgPSBmYWxzZTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cbn0sIHtcblx0aWQ6IDIsXG5cdHRlc3Q6IGZ1bmN0aW9uIHRlc3QoKSB7XG5cdFx0cmV0dXJuICdiYXInID09PSBjcy5jb29raWUoJ2ZvbycsICdmb289YmFyOyB0ZT1tYWpvbScpO1xuXHR9XG59LCB7XG5cdGlkOiAzLFxuXHR0ZXN0OiBmdW5jdGlvbiB0ZXN0KCkge1xuXHRcdHJldHVybiAnMTIzJyA9PT0gY3MuZ2V0UXVlcnlWYWx1ZSgnP2NzYXRpPW1ham9tJnVzZXJfaWQ9MTIzJnZhbGFtaT1zZW1taScsICd1c2VyX2lkJyk7XG5cdH1cbn1dO1xuXG5pZiAoZmFsc2UpIHtcblx0dmFyIHJlc3VsdCA9IHRydWU7XG5cdHRlc3RzLmZvckVhY2goZnVuY3Rpb24gKHRlc3QpIHtcblx0XHRpZiAoIXRlc3QudGVzdCgpKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKHRlc3QuaWQgKyAnLiB0ZXN0IGZhaWxlZCcpO1xuXHRcdFx0cmVzdWx0ID0gZmFsc2U7XG5cdFx0fVxuXHR9KTtcblx0aWYgKHJlc3VsdCkge1xuXHRcdGNvbnNvbGUubG9nKCdBbGwgdGVzdHMgc3VjY2VlZGVkIScpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3M7IiwiJ3VzZSBzdHJpY3QnO1xuXG4vL3ZhciBfID0gcmVxdWlyZSgnbG9kYXNoJyk7XG5cbnZhciB3aXNoID0ge1xuXHRibGFuazogZnVuY3Rpb24gYmxhbmsodXNlcikge1xuXHRcdHJldHVybiB7XG5cdFx0XHR1c2VyOiB1c2VyLFxuXHRcdFx0dGl0bGU6ICcnLFxuXHRcdFx0ZGVzY3JpcHRpb246ICcnLFxuXHRcdFx0ZGlydHk6IHRydWVcblx0XHR9O1xuXHR9LFxuXHRjbGllbnQ6IHtcblx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRpZDogeyB0eXBlOiBbJ3N0cmluZycsICdudWxsJ10sIG9wdGlvbmFsOiB0cnVlIH0sXG5cdFx0XHR0aXRsZTogeyB0eXBlOiAnc3RyaW5nJyB9LFxuXHRcdFx0ZGVzY3JpcHRpb246IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdHVzZXI6IHtcblx0XHRcdFx0dHlwZTogJ29iamVjdCcsXG5cdFx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0XHRpZDogeyB0cHllOiAnc3RyaW5nJyB9LFxuXHRcdFx0XHRcdG5hbWU6IHsgdHlwZTogJ3N0cmluZycgfVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0ZGlydHk6IHsgdHlwZTogJ2Jvb2xlYW4nIH1cblx0XHR9XG5cdH0sXG5cdHNlcnZlcjoge1xuXHRcdHR5cGU6ICdvYmplY3QnLFxuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdGlkOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG5cdFx0XHR0aXRsZTogeyB0eXBlOiAnc3RyaW5nJyB9LFxuXHRcdFx0ZGVzY3JpcHRpb246IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdHVzZXI6IHtcblx0XHRcdFx0dHlwZTogJ29iamVjdCcsXG5cdFx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0XHRpZDogeyB0cHllOiAnc3RyaW5nJyB9LFxuXHRcdFx0XHRcdG5hbWU6IHsgdHlwZTogJ3N0cmluZycgfVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRjbGllbnRUb1NlcnZlcjogZnVuY3Rpb24gY2xpZW50VG9TZXJ2ZXIob2JqKSB7XG5cdFx0dmFyIHdpc2ggPSB7XG5cdFx0XHR1c2VyOiBvYmoudXNlcixcblx0XHRcdGRlc2NyaXB0aW9uOiBvYmouZGVzY3JpcHRpb24sXG5cdFx0XHR0aXRsZTogb2JqLnRpdGxlXG5cdFx0fTtcblx0XHRpZiAob2JqLmlkKSB3aXNoLmlkID0gb2JqLmlkO1xuXHRcdHJldHVybiB3aXNoO1xuXHR9LFxuXHRzZXJ2ZXJUb0NsaWVudDogZnVuY3Rpb24gc2VydmVyVG9DbGllbnQob2JqKSB7XG5cdFx0b2JqLmRpcnR5ID0gZmFsc2U7XG5cdFx0cmV0dXJuIF8uY2xvbmUob2JqKTtcblx0fVxufTtcblxudmFyIHdpc2hMaXN0ID0ge1xuXHRzZXJ2ZXI6IHtcblx0XHR0eXBlOiAnYXJyYXknLFxuXHRcdGl0ZW1zOiB7XG5cdFx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRcdHByb3BlcnRpZXM6IHdpc2guc2VydmVyLnByb3BlcnRpZXNcblx0XHR9XG5cdH1cbn07XG5cbnZhciB1c2VyID0ge1xuXHRibGFuazogZnVuY3Rpb24gYmxhbmsoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGlkOiBudWxsLFxuXHRcdFx0bmFtZTogJycsXG5cdFx0XHRzdGF0dXM6IGJlbGxhLmNvbnN0YW50cy51c2VyU3RhdHVzLkdVRVNUXG5cdFx0fTtcblx0fSxcblx0Y2xpZW50OiB7XG5cdFx0dHlwZTogJ29iamVjdCcsXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0aWQ6IHsgdHlwZTogWydzdHJpbmcnLCAnbnVsbCddLCBvcHRpb25hbDogdHJ1ZSB9LFxuXHRcdFx0bmFtZTogeyB0eXBlOiAnc3RyaW5nJyB9LFxuXHRcdFx0c3RhdHVzOiB7IHR5cGU6ICdzdHJpbmcnLCBlcTogXy52YWx1ZXMoYmVsbGEuY29uc3RhbnRzLnVzZXJTdGF0dXMpIH1cblx0XHR9XG5cdH0sXG5cdHNlcnZlcjoge1xuXHRcdHR5cGU6ICdvYmplY3QnLFxuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdGlkOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG5cdFx0XHRuYW1lOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG5cdFx0XHRzdGF0dXM6IHsgdHlwZTogJ3N0cmluZycsIGVxOiBfLnZhbHVlcyhiZWxsYS5jb25zdGFudHMudXNlclN0YXR1cykgfVxuXHRcdH1cblx0fSxcblx0Y2xpZW50VG9TZXJ2ZXI6IGZ1bmN0aW9uIGNsaWVudFRvU2VydmVyKG9iaikge30sXG5cdHNlcnZlclRvQ2xpZW50OiBmdW5jdGlvbiBzZXJ2ZXJUb0NsaWVudChvYmopIHt9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0d2lzaDogd2lzaCxcblx0d2lzaExpc3Q6IHdpc2hMaXN0LFxuXHR1c2VyOiB1c2VyXG59OyIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNzID0gcmVxdWlyZSgnLi9oZWxwZXJzL2NzJyk7XG4vL3ZhciBpbnNwZWN0b3IgPSByZXF1aXJlKCdzY2hlbWEtaW5zcGVjdG9yJyk7XG52YXIgc2NoZW1hcyA9IHJlcXVpcmUoJy4vc2NoZW1hcycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcblx0d2lzaDoge1xuXHRcdGdldDogZnVuY3Rpb24gZ2V0KGlkLCBjYWxsYmFjaykge1xuXHRcdFx0Y3MuZ2V0KCcvd2lzaD9pZD0nICsgaWQsIGZ1bmN0aW9uIChzdGF0dXMsIHdpc2gpIHtcblx0XHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSB7XG5cdFx0XHRcdFx0dmFyIHZhbGlkYXRpb24gPSBpbnNwZWN0b3IudmFsaWRhdGUoc2NoZW1hcy53aXNoLnNlcnZlciwgd2lzaCk7XG5cdFx0XHRcdFx0aWYgKCF2YWxpZGF0aW9uLnZhbGlkKSB7XG5cdFx0XHRcdFx0XHRjb25zb2xlLmVycm9yKCd3aXNoIHZhbGlkYXRpb24gZXJyb3InLCB2YWxpZGF0aW9uLmZvcm1hdCgpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiB0cnVlIH0sIHNjaGVtYXMud2lzaC5zZXJ2ZXJUb0NsaWVudCh3aXNoKSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuTk9UX0ZPVU5EKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiBmYWxzZSwgbWVzc2FnZTogJ1dpc2ggbm90IGZvdW5kJyB9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSxcblx0XHRwb3N0OiBmdW5jdGlvbiBwb3N0KHdpc2gsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgdmFsaWRhdGlvbiA9IGluc3BlY3Rvci52YWxpZGF0ZShzY2hlbWFzLndpc2guY2xpZW50LCB3aXNoKTtcblx0XHRcdGlmICh2YWxpZGF0aW9uLnZhbGlkKSB7XG5cdFx0XHRcdGNzLnBvc3QoJy93aXNoJywgc2NoZW1hcy53aXNoLmNsaWVudFRvU2VydmVyKHdpc2gpLCBmdW5jdGlvbiAoc3RhdHVzKSB7XG5cdFx0XHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSBjYWxsYmFjayh7IHN1Y2Nlc3M6IHRydWUgfSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0d2lzaExpc3Q6IHtcblx0XHRnZXQ6IGZ1bmN0aW9uIGdldChjYWxsYmFjaykge1xuXHRcdFx0Y3MuZ2V0KCcvd2lzaExpc3QnLCBmdW5jdGlvbiAoc3RhdHVzLCB3aXNoTGlzdCkge1xuXHRcdFx0XHRpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuT0spIHtcblx0XHRcdFx0XHR2YXIgdmFsaWRhdGlvbiA9IGluc3BlY3Rvci52YWxpZGF0ZShzY2hlbWFzLndpc2hMaXN0LnNlcnZlciwgd2lzaExpc3QpO1xuXHRcdFx0XHRcdGNvbnNvbGUubG9nKCd2YWlsZGF0aW9uJywgdmFsaWRhdGlvbik7XG5cdFx0XHRcdFx0aWYgKCF2YWxpZGF0aW9uLnZhbGlkKSBjb25zb2xlLmVycm9yKCd3aXNoTGlzdCBzZXJ2ZXIgdmFsaWRhdGlvbiBlcnJvcicpO1xuXHRcdFx0XHRcdGNhbGxiYWNrKHsgc3VjY2VzczogdHJ1ZSB9LCB3aXNoTGlzdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignd2lzaExpc3QgYWpheCBlcnJvcicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdHVzZXJTdGF0dXM6IHtcblx0XHRnZXQ6IGZ1bmN0aW9uIGdldChjYWxsYmFjaykge1xuXHRcdFx0Y3MuZ2V0KCcvdXNlclN0YXR1cycsIGZ1bmN0aW9uIChzdGF0dXMsIHVzZXJTdGF0dXMpIHtcblx0XHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiB0cnVlIH0sIHVzZXJTdGF0dXMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdGxvZ2luOiBmdW5jdGlvbiBsb2dpbihsb2dpbkRhdGEsIGNhbGxiYWNrKSB7XG5cdFx0Y3MucG9zdCgnL2xvZ2luJywgbG9naW5EYXRhLCBmdW5jdGlvbiAoc3RhdHVzLCB1c2VyKSB7XG5cdFx0XHRpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuT0spIHtcblx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiB0cnVlIH0sIHVzZXIpO1xuXHRcdFx0fSBlbHNlIGlmIChzdGF0dXMgPT09IGJlbGxhLmNvbnN0YW50cy5yZXNwb25zZS5OT1RfRk9VTkQpIHtcblx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiBmYWxzZSB9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0bG9nb3V0OiBmdW5jdGlvbiBsb2dvdXQoY2FsbGJhY2spIHtcblx0XHRjcy5nZXQoJ2xvZ291dCcsIGZ1bmN0aW9uIChzdGF0dXMpIHtcblx0XHRcdGlmIChzdGF0dXMgPT09IGJlbGxhLmNvbnN0YW50cy5yZXNwb25zZS5PSykge1xuXHRcdFx0XHRjYWxsYmFjayh7IHN1Y2Nlc3M6IHRydWUgfSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn07Il19
