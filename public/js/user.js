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
},{"../../helpers/cs":2,"../../schemas":3,"../../server":4}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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
},{"./helpers/cs":2,"./schemas":3}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjL3NjcmlwdHMvY29tcG9uZW50cy91c2VyL3VzZXIuanMiLCJzcmMvc2NyaXB0cy9oZWxwZXJzL2NzLmpzIiwic3JjL3NjcmlwdHMvc2NoZW1hcy5qcyIsInNyYy9zY3JpcHRzL3NlcnZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNzID0gcmVxdWlyZSgnLi4vLi4vaGVscGVycy9jcycpO1xudmFyIHNjaGVtYXMgPSByZXF1aXJlKCcuLi8uLi9zY2hlbWFzJyk7XG52YXIgc2VydmVyID0gcmVxdWlyZSgnLi4vLi4vc2VydmVyJyk7XG52YXIgc3RhdGVzID0ge1xuXHRHTE9CQUw6ICdHTE9CQUwnLFxuXHRTSVpFOiAnU0laRScsXG5cdENPTlRFTlQ6ICdDT05URU5UJyxcblx0U01BTEw6ICdTTUFMTCcsXG5cdEJJRzogJ0JJRycsXG5cdExPR0lOOiAnTE9HSU4nLFxuXHRSRUdJU1RFUjogJ1JFR0lTVEVSJyxcblx0REVUQUlMUzogJ0RFVEFJTFMnXG59O1xudmFyIGNvbnRlbnRzID0ge1xuXHRMT0dJTjogJ0xPR0lOJyxcblx0UkVHSVNURVI6ICdSRUdJU1RFUicsXG5cdERFVEFJTFM6ICdERVRBSUxTJ1xufTtcbnZhciBzdGF0ZUNoYXJ0ID0gU3RhdGl2dXMuY3JlYXRlU3RhdGVjaGFydCgpO1xuXG52YXIgVXNlciA9IFJlYWN0LmNyZWF0ZUNsYXNzKHtcblx0ZGlzcGxheU5hbWU6ICdVc2VyJyxcblxuXHRnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uIGdldEluaXRpYWxTdGF0ZSgpIHtcblx0XHR2YXIgdXNlciA9IHNjaGVtYXMudXNlci5ibGFuaygpO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHN0YXR1czogJ0dVRVNUJyxcblx0XHRcdHVzZXJOYW1lOiB1c2VyLm5hbWUsXG5cdFx0XHRvcGVuZWQ6IGZhbHNlLFxuXHRcdFx0Y29udGVudDogY29udGVudHMuTE9HSU4sXG5cdFx0XHRlcnJvck1lc3NhZ2U6ICcnXG5cdFx0fTtcblx0fSxcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHRzdGF0ZUNoYXJ0LmFkZFN0YXRlKHN0YXRlcy5HTE9CQUwsIHtcblx0XHRcdHN1YnN0YXRlc0FyZUNvbmN1cnJlbnQ6IHRydWUsXG5cdFx0XHRzdGF0ZXM6IFt7XG5cdFx0XHRcdG5hbWU6IHN0YXRlcy5TSVpFLFxuXHRcdFx0XHRpbml0aWFsU3Vic3RhdGU6IHN0YXRlcy5TTUFMTCxcblx0XHRcdFx0c3RhdGVzOiBbe1xuXHRcdFx0XHRcdG5hbWU6IHN0YXRlcy5TTUFMTCxcblx0XHRcdFx0XHRlbnRlclN0YXRlOiBmdW5jdGlvbiBlbnRlclN0YXRlKCkge1xuXHRcdFx0XHRcdFx0X3RoaXMuc2V0U3RhdGUoeyBvcGVuZWQ6IGZhbHNlIH0pO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0dG9nZ2xlU2l6ZTogZnVuY3Rpb24gdG9nZ2xlU2l6ZSgpIHtcblx0XHRcdFx0XHRcdHRoaXMuZ29Ub1N0YXRlKHN0YXRlcy5CSUcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSwge1xuXHRcdFx0XHRcdG5hbWU6IHN0YXRlcy5CSUcsXG5cdFx0XHRcdFx0ZW50ZXJTdGF0ZTogZnVuY3Rpb24gZW50ZXJTdGF0ZSgpIHtcblx0XHRcdFx0XHRcdF90aGlzLnNldFN0YXRlKHsgb3BlbmVkOiB0cnVlIH0pO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0dG9nZ2xlU2l6ZTogZnVuY3Rpb24gdG9nZ2xlU2l6ZSgpIHtcblx0XHRcdFx0XHRcdHRoaXMuZ29Ub1N0YXRlKHN0YXRlcy5TTUFMTCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XVxuXHRcdFx0fSwge1xuXHRcdFx0XHRuYW1lOiBzdGF0ZXMuQ09OVEVOVCxcblx0XHRcdFx0aW5pdGlhbFN1YnN0YXRlOiBzdGF0ZXMuTE9HSU4sXG5cdFx0XHRcdHN0YXRlczogW3tcblx0XHRcdFx0XHRuYW1lOiBzdGF0ZXMuTE9HSU4sXG5cdFx0XHRcdFx0ZW50ZXJTdGF0ZTogZnVuY3Rpb24gZW50ZXJTdGF0ZSgpIHtcblx0XHRcdFx0XHRcdF90aGlzLnNldFN0YXRlKHsgY29udGVudDogY29udGVudHMuTE9HSU4gfSk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRsb2dpblN1Y2Nlc3M6IGZ1bmN0aW9uIGxvZ2luU3VjY2VzcygpIHtcblx0XHRcdFx0XHRcdHRoaXMuZ29Ub1N0YXRlKHN0YXRlcy5ERVRBSUxTKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sIHtcblx0XHRcdFx0XHRuYW1lOiBzdGF0ZXMuUkVHSVNURVIsXG5cdFx0XHRcdFx0ZW50ZXJTdGF0ZTogZnVuY3Rpb24gZW50ZXJTdGF0ZSgpIHtcblx0XHRcdFx0XHRcdF90aGlzLnNldFN0YXRlKHsgY29udGVudDogY29udGVudHMuUkVHSVNURVIgfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCB7XG5cdFx0XHRcdFx0bmFtZTogc3RhdGVzLkRFVEFJTFMsXG5cdFx0XHRcdFx0ZW50ZXJTdGF0ZTogZnVuY3Rpb24gZW50ZXJTdGF0ZSgpIHtcblx0XHRcdFx0XHRcdF90aGlzLnNldFN0YXRlKHtcblx0XHRcdFx0XHRcdFx0Y29udGVudDogY29udGVudHMuREVUQUlMUyxcblx0XHRcdFx0XHRcdFx0dXNlck5hbWU6IGJlbGxhLmRhdGEudXNlci5nZXQoKS5uYW1lXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1dXG5cdFx0XHR9XVxuXHRcdH0pO1xuXG5cdFx0c3RhdGVDaGFydC5pbml0U3RhdGVzKHN0YXRlcy5HTE9CQUwpO1xuXG5cdFx0YmVsbGEuZGF0YS51c2VyLnN1YnNjcmliZShmdW5jdGlvbiAodXNlcikge1xuXHRcdFx0c3dpdGNoICh1c2VyLnN0YXR1cykge1xuXHRcdFx0XHRjYXNlIGJlbGxhLmNvbnN0YW50cy51c2VyU3RhdHVzLkxPR0dFRF9JTjpcblx0XHRcdFx0XHRzdGF0ZUNoYXJ0LnNlbmRFdmVudCgnbG9naW5TdWNjZXNzJywgdXNlcik7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgYmVsbGEuY29uc3RhbnRzLnVzZXJTdGF0dXMuR1VFU1Q6XG5cdFx0XHRcdFx0c3RhdGVDaGFydC5zZW5kRXZlbnQoJ2xvZ291dFN1Y2Nlc3MnKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdGlmIChjcy5jb29raWUoJ3VzZXJfaWQnLCBkb2N1bWVudC5jb29raWUpICYmIGNzLmNvb2tpZSgndG9rZW4nLCBkb2N1bWVudC5jb29raWUpKSB7XG5cdFx0XHRzZXJ2ZXIudXNlclN0YXR1cy5nZXQoZnVuY3Rpb24gKHJlc3VsdCwgdXNlclN0YXR1cykge1xuXHRcdFx0XHRiZWxsYS5kYXRhLnVzZXIuc2V0KHVzZXJTdGF0dXMsIF90aGlzKTtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRiZWxsYS5kYXRhLnVzZXIuc2V0KCdzdGF0dXMnLCBiZWxsYS5jb25zdGFudHMudXNlclN0YXR1cy5HVUVTVCwgdGhpcyk7XG5cdFx0fVxuXHR9LFxuXHRyZW5kZXI6IGZ1bmN0aW9uIHJlbmRlcigpIHtcblx0XHR2YXIgY29udGVudCwgZGlzcGxheSwgZXJyb3JNZXNzYWdlO1xuXG5cdFx0aWYgKHRoaXMuc3RhdGUub3BlbmVkKSB7XG5cdFx0XHRzd2l0Y2ggKHRoaXMuc3RhdGUuY29udGVudCkge1xuXHRcdFx0XHRjYXNlIGNvbnRlbnRzLkxPR0lOOlxuXHRcdFx0XHRcdGNvbnRlbnQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdFx0XHR7IGNsYXNzTmFtZTogJ2JjLXVzZXItcG9wdXAnIH0sXG5cdFx0XHRcdFx0XHRlcnJvck1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHsgdHlwZTogJ3RleHQnLCByZWY6ICduYW1lJywgZGVmYXVsdFZhbHVlOiAnYScgfSksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KCdicicsIG51bGwpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7IHR5cGU6ICd0ZXh0JywgcmVmOiAncGFzc3dvcmQnLCBkZWZhdWx0VmFsdWU6ICcxJyB9KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2JyJywgbnVsbCksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQnYnV0dG9uJyxcblx0XHRcdFx0XHRcdFx0eyBvbkNsaWNrOiB0aGlzLmxvZ2luIH0sXG5cdFx0XHRcdFx0XHRcdCdMb2dpbidcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KCdicicsIG51bGwpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J2EnLFxuXHRcdFx0XHRcdFx0XHR7IGhyZWY6ICcnLCBvbkNsaWNrOiB0aGlzLnJlZ2lzdGVyIH0sXG5cdFx0XHRcdFx0XHRcdCdyZWdpc3Rlcidcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIGNvbnRlbnRzLlJFR0lTVEVSOlxuXHRcdFx0XHRcdGNvbnRlbnQgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdFx0XHR7IGNsYXNzTmFtZTogJ2JjLXVzZXItcG9wdXAnIH0sXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdCdyZWdpc3RyYXRpb24gZm9ybS4uLidcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIGNvbnRlbnRzLkRFVEFJTFM6XG5cdFx0XHRcdFx0Y29udGVudCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHQnZGl2Jyxcblx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHQndXNlciBkZXRhaWxzLi4uJ1xuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0c3dpdGNoICh0aGlzLnN0YXRlLmNvbnRlbnQpIHtcblx0XHRcdGNhc2UgY29udGVudHMuTE9HSU46XG5cdFx0XHRjYXNlIGNvbnRlbnRzLlJFR0lTVEVSOlxuXHRcdFx0XHRkaXNwbGF5ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQnYScsXG5cdFx0XHRcdFx0eyBocmVmOiAnJywgb25DbGljazogdGhpcy50b2dnbGVTaXplIH0sXG5cdFx0XHRcdFx0J2xvZ2luL3JlZ2lzdGVyJ1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgY29udGVudHMuREVUQUlMUzpcblx0XHRcdFx0ZGlzcGxheSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J2EnLFxuXHRcdFx0XHRcdHsgaHJlZjogJycsIG9uQ2xpY2s6IHRoaXMudG9nZ2xlU2l6ZSB9LFxuXHRcdFx0XHRcdCd1c2VyJ1xuXHRcdFx0XHQpO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdCdkaXYnLFxuXHRcdFx0eyBjbGFzc05hbWU6ICdiYy11c2VyJyB9LFxuXHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHQnVSAnLFxuXHRcdFx0XHRkaXNwbGF5XG5cdFx0XHQpLFxuXHRcdFx0Y29udGVudFxuXHRcdCk7XG5cdH0sXG5cdHRvZ2dsZVNpemU6IGZ1bmN0aW9uIHRvZ2dsZVNpemUoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRzdGF0ZUNoYXJ0LnNlbmRFdmVudCgndG9nZ2xlU2l6ZScpO1xuXHR9LFxuXHRsb2dpbjogZnVuY3Rpb24gbG9naW4oKSB7XG5cdFx0dmFyIF90aGlzMiA9IHRoaXM7XG5cblx0XHRzZXJ2ZXIubG9naW4oe1xuXHRcdFx0dXNlcm5hbWU6IHRoaXMucmVmcy5uYW1lLnZhbHVlLFxuXHRcdFx0cGFzc3dvcmQ6IHRoaXMucmVmcy5wYXNzd29yZC52YWx1ZVxuXHRcdH0sIGZ1bmN0aW9uIChyZXN1bHQsIGRhdGEpIHtcblx0XHRcdGlmIChyZXN1bHQuc3VjY2Vzcykge1xuXHRcdFx0XHRiZWxsYS5kYXRhLnVzZXIuc2V0KGRhdGEsIF90aGlzMik7XG5cdFx0XHRcdF90aGlzMi5zZXRTdGF0ZSh7IGVycm9yTWVzc2FnZTogJycgfSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRfdGhpczIuc2V0U3RhdGUoeyBlcnJvck1lc3NhZ2U6ICdXcm9uZyB1c2VybmFtZSBvciBwYXNzd29yZCcgfSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGxvZ291dDogZnVuY3Rpb24gbG9nb3V0KGUpIHtcblx0XHR2YXIgX3RoaXMzID0gdGhpcztcblxuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0XHRzZXJ2ZXIubG9nb3V0KGZ1bmN0aW9uIChyZXN1bHQpIHtcblx0XHRcdGlmIChyZXN1bHQuc3VjY2Vzcykge1xuXHRcdFx0XHRiZWxsYS5kYXRhLnVzZXIuc2V0KHNjaGVtYXMudXNlci5ibGFuaygpLCBfdGhpczMpO1xuXHRcdFx0XHRfdGhpczMuc2V0U3RhdGUoeyBvcGVuZWQ6IGZhbHNlIH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHRyZWdpc3RlcjogZnVuY3Rpb24gcmVnaXN0ZXIoZSkge1xuXHRcdGUucHJldmVudERlZmF1bHQoKTtcblx0fVxufSk7XG5cblJlYWN0RE9NLnJlbmRlcihSZWFjdC5jcmVhdGVFbGVtZW50KFVzZXIsIG51bGwpLCBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnYmMtdXNlci1jb250YWluZXInKSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgY3MgPSB7XG5cdGxvZzogZnVuY3Rpb24gbG9nKHRleHQpIHtcblx0XHRjb25zb2xlLmxvZyh0ZXh0KTtcblx0fSxcblx0Z2V0OiBmdW5jdGlvbiBnZXQodXJsLCBjYWxsYmFjaykge1xuXHRcdHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuXHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcblx0XHRcdFx0aWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuXHRcdFx0XHRcdHZhciByZXNwb25zZSA9IHhoci5yZXNwb25zZSA/IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKSA6IG51bGw7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cywgcmVzcG9uc2UpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHhoci5zdGF0dXMgPT09IDQwNCkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKHhoci5zdGF0dXMpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ2FqYXggZ2V0IGVycm9yJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdHhoci5vcGVuKCdHRVQnLCB1cmwpO1xuXHRcdHhoci5zZW5kKCk7XG5cdH0sXG5cdHBvc3Q6IGZ1bmN0aW9uIHBvc3QodXJsLCBkYXRhLCBjYWxsYmFjaykge1xuXHRcdHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcblxuXHRcdHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAoeGhyLnJlYWR5U3RhdGUgPT09IFhNTEh0dHBSZXF1ZXN0LkRPTkUpIHtcblx0XHRcdFx0aWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuXHRcdFx0XHRcdHZhciByZXNwb25zZSA9IHhoci5yZXNwb25zZSA/IEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlKSA6IG51bGw7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cywgcmVzcG9uc2UpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHhoci5zdGF0dXMgPT09IDQwNCkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKHhoci5zdGF0dXMpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ2FqYXggcG9zdCBlcnJvcicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR4aHIub3BlbignUE9TVCcsIHVybCk7XG5cdFx0eGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG5cdFx0eGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXHR9LFxuXHRjb29raWU6IGZ1bmN0aW9uIGNvb2tpZShuYW1lLCBjb29raWVzKSB7XG5cdFx0dmFyIGMgPSB0aGlzLmNvb2tpZXMoY29va2llcyk7XG5cdFx0cmV0dXJuIGNbbmFtZV07XG5cdH0sXG5cdGNvb2tpZXM6IGZ1bmN0aW9uIGNvb2tpZXMoX2Nvb2tpZXMpIHtcblx0XHR2YXIgbmFtZVZhbHVlcyA9IF9jb29raWVzLnNwbGl0KCc7ICcpO1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRuYW1lVmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdHZhciBpID0gaXRlbS5zcGxpdCgnPScpO1xuXHRcdFx0cmVzdWx0W2lbMF1dID0gaVsxXTtcblx0XHR9KTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRnZXRRdWVyeVZhbHVlOiBmdW5jdGlvbiBnZXRRdWVyeVZhbHVlKHF1ZXJ5U3RyaW5nLCBuYW1lKSB7XG5cdFx0dmFyIGFyciA9IHF1ZXJ5U3RyaW5nLm1hdGNoKG5ldyBSZWdFeHAobmFtZSArICc9KFteJl0rKScpKTtcblxuXHRcdGlmIChhcnIpIHtcblx0XHRcdHJldHVybiBhcnJbMV07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxufTtcblxudmFyIHRlc3RzID0gW3tcblx0aWQ6IDEsXG5cdHRlc3Q6IGZ1bmN0aW9uIHRlc3QoKSB7XG5cdFx0dmFyIGNvb2tpZXMgPSB7XG5cdFx0XHRjc2F0aTogJ21ham9tJyxcblx0XHRcdG9uZTogJ3R3bydcblx0XHR9O1xuXG5cdFx0dmFyIHJlc3VsdCA9IHRydWU7XG5cblx0XHR2YXIgYyA9IGNzLmNvb2tpZXMoJ2NzYXRpPW1ham9tOyBvbmU9dHdvJyk7XG5cblx0XHRpZiAoYy5jc2F0aSAhPT0gY29va2llcy5jc2F0aSkgcmVzdWx0ID0gZmFsc2U7XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59LCB7XG5cdGlkOiAyLFxuXHR0ZXN0OiBmdW5jdGlvbiB0ZXN0KCkge1xuXHRcdHJldHVybiAnYmFyJyA9PT0gY3MuY29va2llKCdmb28nLCAnZm9vPWJhcjsgdGU9bWFqb20nKTtcblx0fVxufSwge1xuXHRpZDogMyxcblx0dGVzdDogZnVuY3Rpb24gdGVzdCgpIHtcblx0XHRyZXR1cm4gJzEyMycgPT09IGNzLmdldFF1ZXJ5VmFsdWUoJz9jc2F0aT1tYWpvbSZ1c2VyX2lkPTEyMyZ2YWxhbWk9c2VtbWknLCAndXNlcl9pZCcpO1xuXHR9XG59XTtcblxuaWYgKGZhbHNlKSB7XG5cdHZhciByZXN1bHQgPSB0cnVlO1xuXHR0ZXN0cy5mb3JFYWNoKGZ1bmN0aW9uICh0ZXN0KSB7XG5cdFx0aWYgKCF0ZXN0LnRlc3QoKSkge1xuXHRcdFx0Y29uc29sZS5lcnJvcih0ZXN0LmlkICsgJy4gdGVzdCBmYWlsZWQnKTtcblx0XHRcdHJlc3VsdCA9IGZhbHNlO1xuXHRcdH1cblx0fSk7XG5cdGlmIChyZXN1bHQpIHtcblx0XHRjb25zb2xlLmxvZygnQWxsIHRlc3RzIHN1Y2NlZWRlZCEnKTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNzOyIsIid1c2Ugc3RyaWN0JztcblxuLy92YXIgXyA9IHJlcXVpcmUoJ2xvZGFzaCcpO1xuXG52YXIgd2lzaCA9IHtcblx0Ymxhbms6IGZ1bmN0aW9uIGJsYW5rKHVzZXIpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dXNlcjogdXNlcixcblx0XHRcdHRpdGxlOiAnJyxcblx0XHRcdGRlc2NyaXB0aW9uOiAnJyxcblx0XHRcdGRpcnR5OiB0cnVlXG5cdFx0fTtcblx0fSxcblx0Y2xpZW50OiB7XG5cdFx0dHlwZTogJ29iamVjdCcsXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0aWQ6IHsgdHlwZTogWydzdHJpbmcnLCAnbnVsbCddLCBvcHRpb25hbDogdHJ1ZSB9LFxuXHRcdFx0dGl0bGU6IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdGRlc2NyaXB0aW9uOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG5cdFx0XHR1c2VyOiB7XG5cdFx0XHRcdHR5cGU6ICdvYmplY3QnLFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdFx0aWQ6IHsgdHB5ZTogJ3N0cmluZycgfSxcblx0XHRcdFx0XHRuYW1lOiB7IHR5cGU6ICdzdHJpbmcnIH1cblx0XHRcdFx0fVxuXHRcdFx0fSxcblx0XHRcdGRpcnR5OiB7IHR5cGU6ICdib29sZWFuJyB9XG5cdFx0fVxuXHR9LFxuXHRzZXJ2ZXI6IHtcblx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRpZDogeyB0eXBlOiAnc3RyaW5nJyB9LFxuXHRcdFx0dGl0bGU6IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdGRlc2NyaXB0aW9uOiB7IHR5cGU6ICdzdHJpbmcnIH0sXG5cdFx0XHR1c2VyOiB7XG5cdFx0XHRcdHR5cGU6ICdvYmplY3QnLFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdFx0aWQ6IHsgdHB5ZTogJ3N0cmluZycgfSxcblx0XHRcdFx0XHRuYW1lOiB7IHR5cGU6ICdzdHJpbmcnIH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0Y2xpZW50VG9TZXJ2ZXI6IGZ1bmN0aW9uIGNsaWVudFRvU2VydmVyKG9iaikge1xuXHRcdHZhciB3aXNoID0ge1xuXHRcdFx0dXNlcjogb2JqLnVzZXIsXG5cdFx0XHRkZXNjcmlwdGlvbjogb2JqLmRlc2NyaXB0aW9uLFxuXHRcdFx0dGl0bGU6IG9iai50aXRsZVxuXHRcdH07XG5cdFx0aWYgKG9iai5pZCkgd2lzaC5pZCA9IG9iai5pZDtcblx0XHRyZXR1cm4gd2lzaDtcblx0fSxcblx0c2VydmVyVG9DbGllbnQ6IGZ1bmN0aW9uIHNlcnZlclRvQ2xpZW50KG9iaikge1xuXHRcdG9iai5kaXJ0eSA9IGZhbHNlO1xuXHRcdHJldHVybiBfLmNsb25lKG9iaik7XG5cdH1cbn07XG5cbnZhciB3aXNoTGlzdCA9IHtcblx0c2VydmVyOiB7XG5cdFx0dHlwZTogJ2FycmF5Jyxcblx0XHRpdGVtczoge1xuXHRcdFx0dHlwZTogJ29iamVjdCcsXG5cdFx0XHRwcm9wZXJ0aWVzOiB3aXNoLnNlcnZlci5wcm9wZXJ0aWVzXG5cdFx0fVxuXHR9XG59O1xuXG52YXIgdXNlciA9IHtcblx0Ymxhbms6IGZ1bmN0aW9uIGJsYW5rKCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRpZDogbnVsbCxcblx0XHRcdG5hbWU6ICcnLFxuXHRcdFx0c3RhdHVzOiBiZWxsYS5jb25zdGFudHMudXNlclN0YXR1cy5HVUVTVFxuXHRcdH07XG5cdH0sXG5cdGNsaWVudDoge1xuXHRcdHR5cGU6ICdvYmplY3QnLFxuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdGlkOiB7IHR5cGU6IFsnc3RyaW5nJywgJ251bGwnXSwgb3B0aW9uYWw6IHRydWUgfSxcblx0XHRcdG5hbWU6IHsgdHlwZTogJ3N0cmluZycgfSxcblx0XHRcdHN0YXR1czogeyB0eXBlOiAnc3RyaW5nJywgZXE6IF8udmFsdWVzKGJlbGxhLmNvbnN0YW50cy51c2VyU3RhdHVzKSB9XG5cdFx0fVxuXHR9LFxuXHRzZXJ2ZXI6IHtcblx0XHR0eXBlOiAnb2JqZWN0Jyxcblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRpZDogeyB0eXBlOiAnc3RyaW5nJyB9LFxuXHRcdFx0bmFtZTogeyB0eXBlOiAnc3RyaW5nJyB9LFxuXHRcdFx0c3RhdHVzOiB7IHR5cGU6ICdzdHJpbmcnLCBlcTogXy52YWx1ZXMoYmVsbGEuY29uc3RhbnRzLnVzZXJTdGF0dXMpIH1cblx0XHR9XG5cdH0sXG5cdGNsaWVudFRvU2VydmVyOiBmdW5jdGlvbiBjbGllbnRUb1NlcnZlcihvYmopIHt9LFxuXHRzZXJ2ZXJUb0NsaWVudDogZnVuY3Rpb24gc2VydmVyVG9DbGllbnQob2JqKSB7fVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHdpc2g6IHdpc2gsXG5cdHdpc2hMaXN0OiB3aXNoTGlzdCxcblx0dXNlcjogdXNlclxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcyA9IHJlcXVpcmUoJy4vaGVscGVycy9jcycpO1xuLy92YXIgaW5zcGVjdG9yID0gcmVxdWlyZSgnc2NoZW1hLWluc3BlY3RvcicpO1xudmFyIHNjaGVtYXMgPSByZXF1aXJlKCcuL3NjaGVtYXMnKTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdHdpc2g6IHtcblx0XHRnZXQ6IGZ1bmN0aW9uIGdldChpZCwgY2FsbGJhY2spIHtcblx0XHRcdGNzLmdldCgnL3dpc2g/aWQ9JyArIGlkLCBmdW5jdGlvbiAoc3RhdHVzLCB3aXNoKSB7XG5cdFx0XHRcdGlmIChzdGF0dXMgPT09IGJlbGxhLmNvbnN0YW50cy5yZXNwb25zZS5PSykge1xuXHRcdFx0XHRcdHZhciB2YWxpZGF0aW9uID0gaW5zcGVjdG9yLnZhbGlkYXRlKHNjaGVtYXMud2lzaC5zZXJ2ZXIsIHdpc2gpO1xuXHRcdFx0XHRcdGlmICghdmFsaWRhdGlvbi52YWxpZCkge1xuXHRcdFx0XHRcdFx0Y29uc29sZS5lcnJvcignd2lzaCB2YWxpZGF0aW9uIGVycm9yJywgdmFsaWRhdGlvbi5mb3JtYXQoKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNhbGxiYWNrKHsgc3VjY2VzczogdHJ1ZSB9LCBzY2hlbWFzLndpc2guc2VydmVyVG9DbGllbnQod2lzaCkpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk5PVF9GT1VORCkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKHsgc3VjY2VzczogZmFsc2UsIG1lc3NhZ2U6ICdXaXNoIG5vdCBmb3VuZCcgfSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0cG9zdDogZnVuY3Rpb24gcG9zdCh3aXNoLCBjYWxsYmFjaykge1xuXHRcdFx0dmFyIHZhbGlkYXRpb24gPSBpbnNwZWN0b3IudmFsaWRhdGUoc2NoZW1hcy53aXNoLmNsaWVudCwgd2lzaCk7XG5cdFx0XHRpZiAodmFsaWRhdGlvbi52YWxpZCkge1xuXHRcdFx0XHRjcy5wb3N0KCcvd2lzaCcsIHNjaGVtYXMud2lzaC5jbGllbnRUb1NlcnZlcih3aXNoKSwgZnVuY3Rpb24gKHN0YXR1cykge1xuXHRcdFx0XHRcdGlmIChzdGF0dXMgPT09IGJlbGxhLmNvbnN0YW50cy5yZXNwb25zZS5PSykgY2FsbGJhY2soeyBzdWNjZXNzOiB0cnVlIH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdHdpc2hMaXN0OiB7XG5cdFx0Z2V0OiBmdW5jdGlvbiBnZXQoY2FsbGJhY2spIHtcblx0XHRcdGNzLmdldCgnL3dpc2hMaXN0JywgZnVuY3Rpb24gKHN0YXR1cywgd2lzaExpc3QpIHtcblx0XHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSB7XG5cdFx0XHRcdFx0dmFyIHZhbGlkYXRpb24gPSBpbnNwZWN0b3IudmFsaWRhdGUoc2NoZW1hcy53aXNoTGlzdC5zZXJ2ZXIsIHdpc2hMaXN0KTtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygndmFpbGRhdGlvbicsIHZhbGlkYXRpb24pO1xuXHRcdFx0XHRcdGlmICghdmFsaWRhdGlvbi52YWxpZCkgY29uc29sZS5lcnJvcignd2lzaExpc3Qgc2VydmVyIHZhbGlkYXRpb24gZXJyb3InKTtcblx0XHRcdFx0XHRjYWxsYmFjayh7IHN1Y2Nlc3M6IHRydWUgfSwgd2lzaExpc3QpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ3dpc2hMaXN0IGFqYXggZXJyb3InKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHR1c2VyU3RhdHVzOiB7XG5cdFx0Z2V0OiBmdW5jdGlvbiBnZXQoY2FsbGJhY2spIHtcblx0XHRcdGNzLmdldCgnL3VzZXJTdGF0dXMnLCBmdW5jdGlvbiAoc3RhdHVzLCB1c2VyU3RhdHVzKSB7XG5cdFx0XHRcdGlmIChzdGF0dXMgPT09IGJlbGxhLmNvbnN0YW50cy5yZXNwb25zZS5PSykge1xuXHRcdFx0XHRcdGNhbGxiYWNrKHsgc3VjY2VzczogdHJ1ZSB9LCB1c2VyU3RhdHVzKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHRsb2dpbjogZnVuY3Rpb24gbG9naW4obG9naW5EYXRhLCBjYWxsYmFjaykge1xuXHRcdGNzLnBvc3QoJy9sb2dpbicsIGxvZ2luRGF0YSwgZnVuY3Rpb24gKHN0YXR1cywgdXNlcikge1xuXHRcdFx0aWYgKHN0YXR1cyA9PT0gYmVsbGEuY29uc3RhbnRzLnJlc3BvbnNlLk9LKSB7XG5cdFx0XHRcdGNhbGxiYWNrKHsgc3VjY2VzczogdHJ1ZSB9LCB1c2VyKTtcblx0XHRcdH0gZWxzZSBpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuTk9UX0ZPVU5EKSB7XG5cdFx0XHRcdGNhbGxiYWNrKHsgc3VjY2VzczogZmFsc2UgfSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdGxvZ291dDogZnVuY3Rpb24gbG9nb3V0KGNhbGxiYWNrKSB7XG5cdFx0Y3MuZ2V0KCdsb2dvdXQnLCBmdW5jdGlvbiAoc3RhdHVzKSB7XG5cdFx0XHRpZiAoc3RhdHVzID09PSBiZWxsYS5jb25zdGFudHMucmVzcG9uc2UuT0spIHtcblx0XHRcdFx0Y2FsbGJhY2soeyBzdWNjZXNzOiB0cnVlIH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG59OyJdfQ==
