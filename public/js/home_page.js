(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var nutrients = require('../../nutrients');
var cs = require('../../helpers/cs');

var HomePage = React.createClass({
	displayName: 'HomePage',

	getInitialState: function getInitialState() {
		return { status: 'init', foods: [] };
	},
	componentDidMount: function componentDidMount() {
		bella.data.user.subscribe(function (user) {
			// do what you want!
		});
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
					var buttons, name, description, paleoOptions, ketoOptions, show;

					if (_this.state.editingFoodId) {
						if (_this.state.editingFoodId === food.ndbno) {
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

							paleoOptions = React.createElement(
								'select',
								{ ref: 'paleoSelect' },
								getPaleoKetoOptions(food.paleo)
							);

							ketoOptions = React.createElement(
								'select',
								{ ref: 'ketoSelect' },
								getPaleoKetoOptions(food.keto)
							);

							name = React.createElement('input', { type: 'text', ref: 'nameInput' });
							description = React.createElement('input', { type: 'text', ref: 'descriptionInput' });
							show = React.createElement('input', { type: 'checkbox', ref: 'showCheckbox' });
						} else {
							buttons = React.createElement(
								'div',
								null,
								'...'
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
							show = React.createElement('input', { type: 'checkbox', ref: 'showCheckbox', disabled: true });
						}
					} else {
						buttons = React.createElement(
							'div',
							null,
							React.createElement(
								'button',
								{ onClick: _this.editFood.bind(_this, food.ndbno) },
								'Edit'
							)
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
						show = React.createElement('input', { type: 'checkbox', ref: 'showCheckbox', disabled: true });
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
							show
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

		function getOptions() {
			return _.map(nutrients.foodGroups, function (foodGroup, key) {
				return React.createElement(
					'option',
					{ key: foodGroup, value: foodGroup },
					key
				);
			});
		}

		function getPaleoKetoOptions(defaultValue) {
			return _.map([10, 5, 1], function (value) {
				return React.createElement(
					'option',
					{ key: value, value: value },
					value
				);
			});
		}

		return React.createElement(
			'div',
			{ className: 'bc-home-page' },
			React.createElement(
				'select',
				{ onChange: this.selectChange },
				React.createElement(
					'option',
					{ value: '0' },
					'...'
				),
				getOptions()
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
							'show'
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
	selectChange: function selectChange(e) {
		this.getNutrientData(e.target.value);
		this.setState({ status: 'loading', editingFoodId: false });
	},
	editFood: function editFood(foodId) {
		this.setState({ editingFoodId: foodId });
	},
	save: function save() {
		console.log(this.refs.descriptionInput.value);
	},
	cancel: function cancel() {
		this.setState({ editingFoodId: false });
	},
	getNutrientData: function getNutrientData(foodGroup) {
		var _this2 = this;

		cs.get('/foods/' + foodGroup, function (status, foods) {
			_this2.setState({ status: 'ready', foods: foods });
		});
	}
});

ReactDOM.render(React.createElement(HomePage, null), document.getElementById('main-section'));
},{"../../helpers/cs":2,"../../nutrients":3}],2:[function(require,module,exports){
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjL3NjcmlwdHMvY29tcG9uZW50cy9ob21lX3BhZ2UvaG9tZV9wYWdlLmpzIiwic3JjL3NjcmlwdHMvaGVscGVycy9jcy5qcyIsInNyYy9zY3JpcHRzL251dHJpZW50cy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDalNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIG51dHJpZW50cyA9IHJlcXVpcmUoJy4uLy4uL251dHJpZW50cycpO1xudmFyIGNzID0gcmVxdWlyZSgnLi4vLi4vaGVscGVycy9jcycpO1xuXG52YXIgSG9tZVBhZ2UgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnSG9tZVBhZ2UnLFxuXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuXHRcdHJldHVybiB7IHN0YXR1czogJ2luaXQnLCBmb29kczogW10gfTtcblx0fSxcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdGJlbGxhLmRhdGEudXNlci5zdWJzY3JpYmUoZnVuY3Rpb24gKHVzZXIpIHtcblx0XHRcdC8vIGRvIHdoYXQgeW91IHdhbnQhXG5cdFx0fSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHR2YXIgbGlzdDtcblxuXHRcdHN3aXRjaCAodGhpcy5zdGF0ZS5zdGF0dXMpIHtcblx0XHRcdGNhc2UgJ2luaXQnOlxuXHRcdFx0XHRsaXN0ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQndHInLFxuXHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0J1NlbGVjdCBhIGZvb2QgY2F0ZWdvcnkhJ1xuXHRcdFx0XHRcdClcblx0XHRcdFx0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdsb2FkaW5nJzpcblx0XHRcdFx0bGlzdCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J3RyJyxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHQndGQnLFxuXHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdCdMb2FkaW5nLi4uJ1xuXHRcdFx0XHRcdClcblx0XHRcdFx0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdyZWFkeSc6XG5cdFx0XHRcdGxpc3QgPSBfLm1hcCh0aGlzLnN0YXRlLmZvb2RzLCBmdW5jdGlvbiAoZm9vZCwga2V5KSB7XG5cdFx0XHRcdFx0dmFyIGJ1dHRvbnMsIG5hbWUsIGRlc2NyaXB0aW9uLCBwYWxlb09wdGlvbnMsIGtldG9PcHRpb25zLCBzaG93O1xuXG5cdFx0XHRcdFx0aWYgKF90aGlzLnN0YXRlLmVkaXRpbmdGb29kSWQpIHtcblx0XHRcdFx0XHRcdGlmIChfdGhpcy5zdGF0ZS5lZGl0aW5nRm9vZElkID09PSBmb29kLm5kYm5vKSB7XG5cdFx0XHRcdFx0XHRcdGJ1dHRvbnMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHRcdCdidXR0b24nLFxuXHRcdFx0XHRcdFx0XHRcdFx0eyBvbkNsaWNrOiBfdGhpcy5zYXZlIH0sXG5cdFx0XHRcdFx0XHRcdFx0XHQnU2F2ZSdcblx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdFx0XHQnYnV0dG9uJyxcblx0XHRcdFx0XHRcdFx0XHRcdHsgb25DbGljazogX3RoaXMuY2FuY2VsIH0sXG5cdFx0XHRcdFx0XHRcdFx0XHQnQ2FuY2VsJ1xuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdFx0XHRwYWxlb09wdGlvbnMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHRcdCdzZWxlY3QnLFxuXHRcdFx0XHRcdFx0XHRcdHsgcmVmOiAncGFsZW9TZWxlY3QnIH0sXG5cdFx0XHRcdFx0XHRcdFx0Z2V0UGFsZW9LZXRvT3B0aW9ucyhmb29kLnBhbGVvKVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdGtldG9PcHRpb25zID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHQnc2VsZWN0Jyxcblx0XHRcdFx0XHRcdFx0XHR7IHJlZjogJ2tldG9TZWxlY3QnIH0sXG5cdFx0XHRcdFx0XHRcdFx0Z2V0UGFsZW9LZXRvT3B0aW9ucyhmb29kLmtldG8pXG5cdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0bmFtZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JywgeyB0eXBlOiAndGV4dCcsIHJlZjogJ25hbWVJbnB1dCcgfSk7XG5cdFx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7IHR5cGU6ICd0ZXh0JywgcmVmOiAnZGVzY3JpcHRpb25JbnB1dCcgfSk7XG5cdFx0XHRcdFx0XHRcdHNob3cgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHsgdHlwZTogJ2NoZWNrYm94JywgcmVmOiAnc2hvd0NoZWNrYm94JyB9KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGJ1dHRvbnMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHRcdCdkaXYnLFxuXHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0Jy4uLidcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0cGFsZW9PcHRpb25zID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRmb29kLnBhbGVvXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdGtldG9PcHRpb25zID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRmb29kLmtldG9cblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0bmFtZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0Zm9vZC5uYW1lXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRmb29kLmRlc2NyaXB0aW9uXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdHNob3cgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHsgdHlwZTogJ2NoZWNrYm94JywgcmVmOiAnc2hvd0NoZWNrYm94JywgZGlzYWJsZWQ6IHRydWUgfSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGJ1dHRvbnMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQnZGl2Jyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHQnYnV0dG9uJyxcblx0XHRcdFx0XHRcdFx0XHR7IG9uQ2xpY2s6IF90aGlzLmVkaXRGb29kLmJpbmQoX3RoaXMsIGZvb2QubmRibm8pIH0sXG5cdFx0XHRcdFx0XHRcdFx0J0VkaXQnXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRwYWxlb09wdGlvbnMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGZvb2QucGFsZW9cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRrZXRvT3B0aW9ucyA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCdzcGFuJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0Zm9vZC5rZXRvXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0bmFtZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCdzcGFuJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0Zm9vZC5uYW1lXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb24gPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGZvb2QuZGVzY3JpcHRpb25cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRzaG93ID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7IHR5cGU6ICdjaGVja2JveCcsIHJlZjogJ3Nob3dDaGVja2JveCcsIGRpc2FibGVkOiB0cnVlIH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0J3RyJyxcblx0XHRcdFx0XHRcdHsga2V5OiBrZXkgfSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGZvb2Qub3JpZ2luYWxfbmFtZVxuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdG5hbWVcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGQnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRkZXNjcmlwdGlvblxuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdHBhbGVvT3B0aW9uc1xuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGtldG9PcHRpb25zXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3RkJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0c2hvd1xuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGJ1dHRvbnNcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZ2V0T3B0aW9ucygpIHtcblx0XHRcdHJldHVybiBfLm1hcChudXRyaWVudHMuZm9vZEdyb3VwcywgZnVuY3Rpb24gKGZvb2RHcm91cCwga2V5KSB7XG5cdFx0XHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdvcHRpb24nLFxuXHRcdFx0XHRcdHsga2V5OiBmb29kR3JvdXAsIHZhbHVlOiBmb29kR3JvdXAgfSxcblx0XHRcdFx0XHRrZXlcblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGdldFBhbGVvS2V0b09wdGlvbnMoZGVmYXVsdFZhbHVlKSB7XG5cdFx0XHRyZXR1cm4gXy5tYXAoWzEwLCA1LCAxXSwgZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdvcHRpb24nLFxuXHRcdFx0XHRcdHsga2V5OiB2YWx1ZSwgdmFsdWU6IHZhbHVlIH0sXG5cdFx0XHRcdFx0dmFsdWVcblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHR7IGNsYXNzTmFtZTogJ2JjLWhvbWUtcGFnZScgfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdzZWxlY3QnLFxuXHRcdFx0XHR7IG9uQ2hhbmdlOiB0aGlzLnNlbGVjdENoYW5nZSB9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdvcHRpb24nLFxuXHRcdFx0XHRcdHsgdmFsdWU6ICcwJyB9LFxuXHRcdFx0XHRcdCcuLi4nXG5cdFx0XHRcdCksXG5cdFx0XHRcdGdldE9wdGlvbnMoKVxuXHRcdFx0KSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCd0YWJsZScsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J3RoZWFkJyxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHQndHInLFxuXHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0aCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdCdvcmlnaW5hbE5hbWUnXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3RoJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0J25hbWUnXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3RoJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0J2Rlc2NyaXB0aW9uJ1xuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0aCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdCdwYWxlbydcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGgnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHQna2V0bydcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGgnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHQnc2hvdydcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KCd0aCcsIG51bGwpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCd0Ym9keScsXG5cdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRsaXN0XG5cdFx0XHRcdClcblx0XHRcdClcblx0XHQpO1xuXHR9LFxuXHRzZWxlY3RDaGFuZ2U6IGZ1bmN0aW9uIHNlbGVjdENoYW5nZShlKSB7XG5cdFx0dGhpcy5nZXROdXRyaWVudERhdGEoZS50YXJnZXQudmFsdWUpO1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBzdGF0dXM6ICdsb2FkaW5nJywgZWRpdGluZ0Zvb2RJZDogZmFsc2UgfSk7XG5cdH0sXG5cdGVkaXRGb29kOiBmdW5jdGlvbiBlZGl0Rm9vZChmb29kSWQpIHtcblx0XHR0aGlzLnNldFN0YXRlKHsgZWRpdGluZ0Zvb2RJZDogZm9vZElkIH0pO1xuXHR9LFxuXHRzYXZlOiBmdW5jdGlvbiBzYXZlKCkge1xuXHRcdGNvbnNvbGUubG9nKHRoaXMucmVmcy5kZXNjcmlwdGlvbklucHV0LnZhbHVlKTtcblx0fSxcblx0Y2FuY2VsOiBmdW5jdGlvbiBjYW5jZWwoKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGVkaXRpbmdGb29kSWQ6IGZhbHNlIH0pO1xuXHR9LFxuXHRnZXROdXRyaWVudERhdGE6IGZ1bmN0aW9uIGdldE51dHJpZW50RGF0YShmb29kR3JvdXApIHtcblx0XHR2YXIgX3RoaXMyID0gdGhpcztcblxuXHRcdGNzLmdldCgnL2Zvb2RzLycgKyBmb29kR3JvdXAsIGZ1bmN0aW9uIChzdGF0dXMsIGZvb2RzKSB7XG5cdFx0XHRfdGhpczIuc2V0U3RhdGUoeyBzdGF0dXM6ICdyZWFkeScsIGZvb2RzOiBmb29kcyB9KTtcblx0XHR9KTtcblx0fVxufSk7XG5cblJlYWN0RE9NLnJlbmRlcihSZWFjdC5jcmVhdGVFbGVtZW50KEhvbWVQYWdlLCBudWxsKSwgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ21haW4tc2VjdGlvbicpKTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcyA9IHtcblx0bG9nOiBmdW5jdGlvbiBsb2codGV4dCkge1xuXHRcdGNvbnNvbGUubG9nKHRleHQpO1xuXHR9LFxuXHRnZXQ6IGZ1bmN0aW9uIGdldCh1cmwsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG5cdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuXHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0dmFyIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlID8gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpIDogbnVsbDtcblx0XHRcdFx0XHRjYWxsYmFjayh4aHIuc3RhdHVzLCByZXNwb25zZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoeGhyLnN0YXR1cyA9PT0gNDA0KSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignYWpheCBnZXQgZXJyb3InKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0eGhyLm9wZW4oJ0dFVCcsIHVybCk7XG5cdFx0eGhyLnNlbmQoKTtcblx0fSxcblx0cG9zdDogZnVuY3Rpb24gcG9zdCh1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG5cdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuXHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0dmFyIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlID8gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpIDogbnVsbDtcblx0XHRcdFx0XHRjYWxsYmFjayh4aHIuc3RhdHVzLCByZXNwb25zZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoeGhyLnN0YXR1cyA9PT0gNDA0KSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignYWpheCBwb3N0IGVycm9yJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdHhoci5vcGVuKCdQT1NUJywgdXJsKTtcblx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblx0XHR4aHIuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cdH0sXG5cdGNvb2tpZTogZnVuY3Rpb24gY29va2llKG5hbWUsIGNvb2tpZXMpIHtcblx0XHR2YXIgYyA9IHRoaXMuY29va2llcyhjb29raWVzKTtcblx0XHRyZXR1cm4gY1tuYW1lXTtcblx0fSxcblx0Y29va2llczogZnVuY3Rpb24gY29va2llcyhfY29va2llcykge1xuXHRcdHZhciBuYW1lVmFsdWVzID0gX2Nvb2tpZXMuc3BsaXQoJzsgJyk7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdG5hbWVWYWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIGkgPSBpdGVtLnNwbGl0KCc9Jyk7XG5cdFx0XHRyZXN1bHRbaVswXV0gPSBpWzFdO1xuXHRcdH0pO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdGdldFF1ZXJ5VmFsdWU6IGZ1bmN0aW9uIGdldFF1ZXJ5VmFsdWUocXVlcnlTdHJpbmcsIG5hbWUpIHtcblx0XHR2YXIgYXJyID0gcXVlcnlTdHJpbmcubWF0Y2gobmV3IFJlZ0V4cChuYW1lICsgJz0oW14mXSspJykpO1xuXG5cdFx0aWYgKGFycikge1xuXHRcdFx0cmV0dXJuIGFyclsxXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgdGVzdHMgPSBbe1xuXHRpZDogMSxcblx0dGVzdDogZnVuY3Rpb24gdGVzdCgpIHtcblx0XHR2YXIgY29va2llcyA9IHtcblx0XHRcdGNzYXRpOiAnbWFqb20nLFxuXHRcdFx0b25lOiAndHdvJ1xuXHRcdH07XG5cblx0XHR2YXIgcmVzdWx0ID0gdHJ1ZTtcblxuXHRcdHZhciBjID0gY3MuY29va2llcygnY3NhdGk9bWFqb207IG9uZT10d28nKTtcblxuXHRcdGlmIChjLmNzYXRpICE9PSBjb29raWVzLmNzYXRpKSByZXN1bHQgPSBmYWxzZTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cbn0sIHtcblx0aWQ6IDIsXG5cdHRlc3Q6IGZ1bmN0aW9uIHRlc3QoKSB7XG5cdFx0cmV0dXJuICdiYXInID09PSBjcy5jb29raWUoJ2ZvbycsICdmb289YmFyOyB0ZT1tYWpvbScpO1xuXHR9XG59LCB7XG5cdGlkOiAzLFxuXHR0ZXN0OiBmdW5jdGlvbiB0ZXN0KCkge1xuXHRcdHJldHVybiAnMTIzJyA9PT0gY3MuZ2V0UXVlcnlWYWx1ZSgnP2NzYXRpPW1ham9tJnVzZXJfaWQ9MTIzJnZhbGFtaT1zZW1taScsICd1c2VyX2lkJyk7XG5cdH1cbn1dO1xuXG5pZiAoZmFsc2UpIHtcblx0dmFyIHJlc3VsdCA9IHRydWU7XG5cdHRlc3RzLmZvckVhY2goZnVuY3Rpb24gKHRlc3QpIHtcblx0XHRpZiAoIXRlc3QudGVzdCgpKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKHRlc3QuaWQgKyAnLiB0ZXN0IGZhaWxlZCcpO1xuXHRcdFx0cmVzdWx0ID0gZmFsc2U7XG5cdFx0fVxuXHR9KTtcblx0aWYgKHJlc3VsdCkge1xuXHRcdGNvbnNvbGUubG9nKCdBbGwgdGVzdHMgc3VjY2VlZGVkIScpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3M7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbnV0cmllbnRzID0ge1xuXHQnZW5lcmd5JzogJzIwOCcsXG5cdCdwcm90ZWluJzogJzIwMycsXG5cdCdmYXQnOiAnMjA0Jyxcblx0J2NhcmJvaHlkcmF0ZSc6ICcyMDUnLFxuXHQnZmliZXInOiAnMjkxJyxcblx0J3N1Z2FyJzogJzI2OScsXG5cdCdDYSc6ICczMDEnLFxuXHQnRmUnOiAnMzAzJyxcblx0J01nJzogJzMwNCcsXG5cdCdQJzogJzMwNScsXG5cdCdLJzogJzMwNicsXG5cdCdOYSc6ICczMDcnLFxuXHQnWm4nOiAnMzA5Jyxcblx0J0N1JzogJzMxMicsXG5cdCdNbic6ICczMTUnLFxuXHQnU2UnOiAnMzE3Jyxcblx0J0YnOiAnMzEzJyxcblx0J3ZfYSc6ICczMTgnLFxuXHQndl9iNic6ICc0MTUnLFxuXHQndl9iMTInOiAnNDE4Jyxcblx0J3ZfYyc6ICc0MDEnLFxuXHQndl9kMyc6ICczMjYnLFxuXHQndl9lJzogJzMyMycsXG5cdCd2X2snOiAnNDMwJyxcblx0J2ZhdHR5X2FjaWRzX3RvdGFsX3NhdHVyYXRlZCc6ICc2MDYnLFxuXHQnZmF0dHlfYWNpZHNfdG90YWxfbW9ub3Vuc2F0dXJhdGVkJzogJzY0NScsXG5cdCdmYXR0eV9hY2lkc190b3RhbF9wb2x5dW5zYXR1cmF0ZWQnOiAnNjQ2Jyxcblx0J2ZhdHR5X2FjaWRzX3RvdGFsX3RyYW5zJzogJzYwNScsXG5cdCdEUEEnOiAnNjMxJyxcblx0J0RIQSc6ICc2MjEnLFxuXHQnY2hvbGVzdGVyb2wnOiAnNjAxJyxcblx0J2FsY29ob2xfZXRoeWwnOiAnMjIxJyxcblx0J2NhZmZlaW5lJzogJzI2Midcbn07XG5cbnZhciBmb29kR3JvdXBzID0ge1xuXHQnZWdnJzogJzEnLFxuXHQnc3BpY2VzX2FuZF9oZXJicyc6ICcyJyxcblx0J2JhYnlfZm9vZHMnOiAnMycsXG5cdCdmYXRzX2FuZF9vaWxzJzogJzQnLFxuXHQncG91bHRyeSc6ICc1Jyxcblx0J3NvdXBzX3NhdWNlc19hbmRfZ3Jhdmllcyc6ICc2Jyxcblx0J3NhdXNhZ2VzX2FuZF9sdW5jaGVvbl9tZWF0cyc6ICc3Jyxcblx0J2JyZWFrZmFzdF9jZXJlYWxzJzogJzgnLFxuXHQnZnJ1aXRzX2FuZF9mcnVpdF9qdWljZXMnOiAnOScsXG5cdCdwb3JrJzogJzEwJyxcblx0J3ZlZ2V0YWJsZXMnOiAnMTEnLFxuXHQnbnV0c19hbmRfc2VlZHMnOiAnMTInLFxuXHQnYmVlZic6ICcxMycsXG5cdCdiZXZlcmFnZXMnOiAnMTQnLFxuXHQnZmlzaF9hbmRfc2hlbGxmaXNoJzogJzE1Jyxcblx0J2xlZ3VtZXMnOiAnMTYnLFxuXHQnbGFtYl92ZWFsX2FuZF9nYW1lJzogJzE3Jyxcblx0J2Jha2VkX3Byb2R1Y3RzJzogJzE4Jyxcblx0J3N3ZWV0cyc6ICcxOScsXG5cdCdjZXJlYWxfZ3JhaW5zX2FuZF9wYXN0YSc6ICcyMCcsXG5cdCdmYXN0X2Zvb2RzJzogJzIxJyxcblx0J21lYWxzX2VudHJlZXNfYW5kX3NpZGVfZGlzaGVzJzogJzIyJ1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG51dHJpZW50czogbnV0cmllbnRzLFxuXHRmb29kR3JvdXBzOiBmb29kR3JvdXBzLFxuXHRhcGlLZXk6ICdQWXphNmo1VzZNMkNxODYzc3ZKeGl6MXA4cVYycW9HQ2dHZjBTeUg0J1xufTsiXX0=
