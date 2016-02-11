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
					var buttons, name, description, category, paleoOptions, ketoOptions, show;

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

							category = React.createElement(
								'select',
								{ ref: 'categorySelect' },
								React.createElement(
									'option',
									{ value: '0' },
									'choose one...'
								),
								getCategoryOptions()
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
							category = React.createElement(
								'span',
								null,
								food.category
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
						category = React.createElement(
							'span',
							null,
							food.category
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

		function getCategoryOptions() {
			return _.map(require('../../food').short, function (food, key) {
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
},{"../../food":2,"../../helpers/cs":3,"../../nutrients":4}],2:[function(require,module,exports){
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
},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjL3NjcmlwdHMvY29tcG9uZW50cy9ob21lX3BhZ2UvaG9tZV9wYWdlLmpzIiwic3JjL3NjcmlwdHMvZm9vZC5qcyIsInNyYy9zY3JpcHRzL2hlbHBlcnMvY3MuanMiLCJzcmMvc2NyaXB0cy9udXRyaWVudHMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0hBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIG51dHJpZW50cyA9IHJlcXVpcmUoJy4uLy4uL251dHJpZW50cycpO1xudmFyIGNzID0gcmVxdWlyZSgnLi4vLi4vaGVscGVycy9jcycpO1xuXG52YXIgSG9tZVBhZ2UgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG5cdGRpc3BsYXlOYW1lOiAnSG9tZVBhZ2UnLFxuXG5cdGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gZ2V0SW5pdGlhbFN0YXRlKCkge1xuXHRcdHJldHVybiB7IHN0YXR1czogJ2luaXQnLCBmb29kczogW10gfTtcblx0fSxcblx0Y29tcG9uZW50RGlkTW91bnQ6IGZ1bmN0aW9uIGNvbXBvbmVudERpZE1vdW50KCkge1xuXHRcdGJlbGxhLmRhdGEudXNlci5zdWJzY3JpYmUoZnVuY3Rpb24gKHVzZXIpIHtcblx0XHRcdC8vIGRvIHdoYXQgeW91IHdhbnQhXG5cdFx0fSk7XG5cdH0sXG5cdHJlbmRlcjogZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdHZhciBfdGhpcyA9IHRoaXM7XG5cblx0XHR2YXIgbGlzdDtcblxuXHRcdHN3aXRjaCAodGhpcy5zdGF0ZS5zdGF0dXMpIHtcblx0XHRcdGNhc2UgJ2luaXQnOlxuXHRcdFx0XHRsaXN0ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQndHInLFxuXHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0J1NlbGVjdCBhIGZvb2QgY2F0ZWdvcnkhJ1xuXHRcdFx0XHRcdClcblx0XHRcdFx0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdsb2FkaW5nJzpcblx0XHRcdFx0bGlzdCA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J3RyJyxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHQndGQnLFxuXHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdCdMb2FkaW5nLi4uJ1xuXHRcdFx0XHRcdClcblx0XHRcdFx0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlICdyZWFkeSc6XG5cdFx0XHRcdGxpc3QgPSBfLm1hcCh0aGlzLnN0YXRlLmZvb2RzLCBmdW5jdGlvbiAoZm9vZCwga2V5KSB7XG5cdFx0XHRcdFx0dmFyIGJ1dHRvbnMsIG5hbWUsIGRlc2NyaXB0aW9uLCBjYXRlZ29yeSwgcGFsZW9PcHRpb25zLCBrZXRvT3B0aW9ucywgc2hvdztcblxuXHRcdFx0XHRcdGlmIChfdGhpcy5zdGF0ZS5lZGl0aW5nRm9vZElkKSB7XG5cdFx0XHRcdFx0XHRpZiAoX3RoaXMuc3RhdGUuZWRpdGluZ0Zvb2RJZCA9PT0gZm9vZC5uZGJubykge1xuXHRcdFx0XHRcdFx0XHRidXR0b25zID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHQnZGl2Jyxcblx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdFx0XHQnYnV0dG9uJyxcblx0XHRcdFx0XHRcdFx0XHRcdHsgb25DbGljazogX3RoaXMuc2F2ZSB9LFxuXHRcdFx0XHRcdFx0XHRcdFx0J1NhdmUnXG5cdFx0XHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHRcdFx0J2J1dHRvbicsXG5cdFx0XHRcdFx0XHRcdFx0XHR7IG9uQ2xpY2s6IF90aGlzLmNhbmNlbCB9LFxuXHRcdFx0XHRcdFx0XHRcdFx0J0NhbmNlbCdcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0Y2F0ZWdvcnkgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHRcdCdzZWxlY3QnLFxuXHRcdFx0XHRcdFx0XHRcdHsgcmVmOiAnY2F0ZWdvcnlTZWxlY3QnIH0sXG5cdFx0XHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHRcdCdvcHRpb24nLFxuXHRcdFx0XHRcdFx0XHRcdFx0eyB2YWx1ZTogJzAnIH0sXG5cdFx0XHRcdFx0XHRcdFx0XHQnY2hvb3NlIG9uZS4uLidcblx0XHRcdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0XHRcdGdldENhdGVnb3J5T3B0aW9ucygpXG5cdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0cGFsZW9PcHRpb25zID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHQnc2VsZWN0Jyxcblx0XHRcdFx0XHRcdFx0XHR7IHJlZjogJ3BhbGVvU2VsZWN0JyB9LFxuXHRcdFx0XHRcdFx0XHRcdGdldFBhbGVvS2V0b09wdGlvbnMoZm9vZC5wYWxlbylcblx0XHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdFx0XHRrZXRvT3B0aW9ucyA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdFx0J3NlbGVjdCcsXG5cdFx0XHRcdFx0XHRcdFx0eyByZWY6ICdrZXRvU2VsZWN0JyB9LFxuXHRcdFx0XHRcdFx0XHRcdGdldFBhbGVvS2V0b09wdGlvbnMoZm9vZC5rZXRvKVxuXHRcdFx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0XHRcdG5hbWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KCdpbnB1dCcsIHsgdHlwZTogJ3RleHQnLCByZWY6ICduYW1lSW5wdXQnIH0pO1xuXHRcdFx0XHRcdFx0XHRkZXNjcmlwdGlvbiA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoJ2lucHV0JywgeyB0eXBlOiAndGV4dCcsIHJlZjogJ2Rlc2NyaXB0aW9uSW5wdXQnIH0pO1xuXHRcdFx0XHRcdFx0XHRzaG93ID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7IHR5cGU6ICdjaGVja2JveCcsIHJlZjogJ3Nob3dDaGVja2JveCcgfSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRidXR0b25zID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHQnZGl2Jyxcblx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdCcuLi4nXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdGNhdGVnb3J5ID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRmb29kLmNhdGVnb3J5XG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdHBhbGVvT3B0aW9ucyA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0Zm9vZC5wYWxlb1xuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRrZXRvT3B0aW9ucyA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0Zm9vZC5rZXRvXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdG5hbWUgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHRcdCdzcGFuJyxcblx0XHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRcdGZvb2QubmFtZVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRkZXNjcmlwdGlvbiA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdFx0J3NwYW4nLFxuXHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0Zm9vZC5kZXNjcmlwdGlvblxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRzaG93ID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7IHR5cGU6ICdjaGVja2JveCcsIHJlZjogJ3Nob3dDaGVja2JveCcsIGRpc2FibGVkOiB0cnVlIH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRidXR0b25zID0gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J2RpdicsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdFx0J2J1dHRvbicsXG5cdFx0XHRcdFx0XHRcdFx0eyBvbkNsaWNrOiBfdGhpcy5lZGl0Rm9vZC5iaW5kKF90aGlzLCBmb29kLm5kYm5vKSB9LFxuXHRcdFx0XHRcdFx0XHRcdCdFZGl0J1xuXHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0Y2F0ZWdvcnkgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGZvb2QuY2F0ZWdvcnlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRwYWxlb09wdGlvbnMgPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGZvb2QucGFsZW9cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRrZXRvT3B0aW9ucyA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCdzcGFuJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0Zm9vZC5rZXRvXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0bmFtZSA9IFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCdzcGFuJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0Zm9vZC5uYW1lXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0ZGVzY3JpcHRpb24gPSBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQnc3BhbicsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGZvb2QuZGVzY3JpcHRpb25cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRzaG93ID0gUmVhY3QuY3JlYXRlRWxlbWVudCgnaW5wdXQnLCB7IHR5cGU6ICdjaGVja2JveCcsIHJlZjogJ3Nob3dDaGVja2JveCcsIGRpc2FibGVkOiB0cnVlIH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0J3RyJyxcblx0XHRcdFx0XHRcdHsga2V5OiBrZXkgfSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGZvb2Qub3JpZ2luYWxfbmFtZVxuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdG5hbWVcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGQnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRkZXNjcmlwdGlvblxuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0ZCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdGNhdGVnb3J5XG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3RkJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0cGFsZW9PcHRpb25zXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3RkJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0a2V0b09wdGlvbnNcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGQnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRzaG93XG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3RkJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0YnV0dG9uc1xuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBnZXRPcHRpb25zKCkge1xuXHRcdFx0cmV0dXJuIF8ubWFwKG51dHJpZW50cy5mb29kR3JvdXBzLCBmdW5jdGlvbiAoZm9vZEdyb3VwLCBrZXkpIHtcblx0XHRcdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J29wdGlvbicsXG5cdFx0XHRcdFx0eyBrZXk6IGZvb2RHcm91cCwgdmFsdWU6IGZvb2RHcm91cCB9LFxuXHRcdFx0XHRcdGtleVxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZ2V0UGFsZW9LZXRvT3B0aW9ucyhkZWZhdWx0VmFsdWUpIHtcblx0XHRcdHJldHVybiBfLm1hcChbMTAsIDUsIDFdLCBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0cmV0dXJuIFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J29wdGlvbicsXG5cdFx0XHRcdFx0eyBrZXk6IHZhbHVlLCB2YWx1ZTogdmFsdWUgfSxcblx0XHRcdFx0XHR2YWx1ZVxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gZ2V0Q2F0ZWdvcnlPcHRpb25zKCkge1xuXHRcdFx0cmV0dXJuIF8ubWFwKHJlcXVpcmUoJy4uLy4uL2Zvb2QnKS5zaG9ydCwgZnVuY3Rpb24gKGZvb2QsIGtleSkge1xuXHRcdFx0XHRyZXR1cm4gUmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQnb3B0aW9uJyxcblx0XHRcdFx0XHR7IGtleToga2V5LCB2YWx1ZTogZm9vZFswXSB9LFxuXHRcdFx0XHRcdGZvb2RbMF0gKyAnXFx0JyArIGZvb2RbMV1cblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0J2RpdicsXG5cdFx0XHR7IGNsYXNzTmFtZTogJ2JjLWhvbWUtcGFnZScgfSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCdzZWxlY3QnLFxuXHRcdFx0XHR7IG9uQ2hhbmdlOiB0aGlzLnNlbGVjdENoYW5nZSB9LFxuXHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdCdvcHRpb24nLFxuXHRcdFx0XHRcdHsgdmFsdWU6ICcwJyB9LFxuXHRcdFx0XHRcdCcuLi4nXG5cdFx0XHRcdCksXG5cdFx0XHRcdGdldE9wdGlvbnMoKVxuXHRcdFx0KSxcblx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdCd0YWJsZScsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0J3RoZWFkJyxcblx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHQndHInLFxuXHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0aCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdCdvcmlnaW5hbE5hbWUnXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3RoJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0J25hbWUnXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3RoJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0J2Rlc2NyaXB0aW9uJ1xuXHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFJlYWN0LmNyZWF0ZUVsZW1lbnQoXG5cdFx0XHRcdFx0XHRcdCd0aCcsXG5cdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdCdjYXRlZ29yeSdcblx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRSZWFjdC5jcmVhdGVFbGVtZW50KFxuXHRcdFx0XHRcdFx0XHQndGgnLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHQncGFsZW8nXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3RoJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0J2tldG8nXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHRcdFx0J3RoJyxcblx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0J3Nob3cnXG5cdFx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudCgndGgnLCBudWxsKVxuXHRcdFx0XHRcdClcblx0XHRcdFx0KSxcblx0XHRcdFx0UmVhY3QuY3JlYXRlRWxlbWVudChcblx0XHRcdFx0XHQndGJvZHknLFxuXHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0bGlzdFxuXHRcdFx0XHQpXG5cdFx0XHQpXG5cdFx0KTtcblx0fSxcblx0c2VsZWN0Q2hhbmdlOiBmdW5jdGlvbiBzZWxlY3RDaGFuZ2UoZSkge1xuXHRcdHRoaXMuZ2V0TnV0cmllbnREYXRhKGUudGFyZ2V0LnZhbHVlKTtcblx0XHR0aGlzLnNldFN0YXRlKHsgc3RhdHVzOiAnbG9hZGluZycsIGVkaXRpbmdGb29kSWQ6IGZhbHNlIH0pO1xuXHR9LFxuXHRlZGl0Rm9vZDogZnVuY3Rpb24gZWRpdEZvb2QoZm9vZElkKSB7XG5cdFx0dGhpcy5zZXRTdGF0ZSh7IGVkaXRpbmdGb29kSWQ6IGZvb2RJZCB9KTtcblx0fSxcblx0c2F2ZTogZnVuY3Rpb24gc2F2ZSgpIHtcblx0XHRjb25zb2xlLmxvZyh0aGlzLnJlZnMuZGVzY3JpcHRpb25JbnB1dC52YWx1ZSk7XG5cdH0sXG5cdGNhbmNlbDogZnVuY3Rpb24gY2FuY2VsKCkge1xuXHRcdHRoaXMuc2V0U3RhdGUoeyBlZGl0aW5nRm9vZElkOiBmYWxzZSB9KTtcblx0fSxcblx0Z2V0TnV0cmllbnREYXRhOiBmdW5jdGlvbiBnZXROdXRyaWVudERhdGEoZm9vZEdyb3VwKSB7XG5cdFx0dmFyIF90aGlzMiA9IHRoaXM7XG5cblx0XHRjcy5nZXQoJy9mb29kcy8nICsgZm9vZEdyb3VwLCBmdW5jdGlvbiAoc3RhdHVzLCBmb29kcykge1xuXHRcdFx0X3RoaXMyLnNldFN0YXRlKHsgc3RhdHVzOiAncmVhZHknLCBmb29kczogZm9vZHMgfSk7XG5cdFx0fSk7XG5cdH1cbn0pO1xuXG5SZWFjdERPTS5yZW5kZXIoUmVhY3QuY3JlYXRlRWxlbWVudChIb21lUGFnZSwgbnVsbCksIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdtYWluLXNlY3Rpb24nKSk7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2hvcnQgPSBbWycxLjEnLCAnZ3JhaW4gYmFzZWQgYmFrZWQnXSwgWycxLjInLCAnZ3JhaW4gZnJlZSBiYWtlZCddLCBbJzIuMS4xJywgJ2JlZXInXSwgWycyLjEuMicsICdkaXN0aWxsZWQnXSwgWycyLjEuMycsICdsaXF1b3InXSwgWycyLjEuNCcsICd3aW5lJ10sIFsnMicsICdjZXJlYWwgZ3JhaW5zIGFuZCBwYXN0YSddLCBbJzQuMScsICdkYWlyeSddLCBbJzQuMicsICdlZ2cnXSwgWyc1JywgJ2ZhdHMgYW5kIG9pbHMnXSwgWyc2JywgJ2Zpc2ggYW5kIHNoZWxsZmlzaCddLCBbJzcnLCAnZnJ1aXQgYW5kIGp1aWNlcyddLCBbJzgnLCAnbGVndW1lcyddLCBbJzkuMScsICdiZWVmJ10sIFsnOS4yJywgJ3BvcmsnXSwgWyc5LjMuMScsICdjaGlja2VuJ10sIFsnOS4zLjInLCAndHVya2V5J10sIFsnOS4zLjMnLCAnZHVjayddLCBbJzkuMy40JywgJ2dvb3NlJ10sIFsnOS40JywgJ2xhbWInXSwgWyc5LjUnLCAnZ2FtZSddLCBbJzEwJywgJ251dHMgYW5kIHNlZWRzJ10sIFsnMTEnLCAnc3BpY2VzIGFuZCBoZXJicyddLCBbJzEyJywgJ3ZlZ2V0YWJsZXMnXV07XG5cbnZhciBjYXRlZ29yaWVzID0ge1xuICAgIDE6IHtcbiAgICAgICAgbmFtZTogJ2Jha2VkIHByb2R1Y3RzJyxcbiAgICAgICAgc3ViOiB7XG4gICAgICAgICAgICAxOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2dyYWluIGJhc2VkIGJha2VkIHByb2R1Y3RzJyxcbiAgICAgICAgICAgICAgICBwYWxlbzogZmFsc2VcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAyOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ2dyYWluIGZyZWUgYmFrZWQgcHJvZHVjdHMnXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIDI6IHtcbiAgICAgICAgbmFtZTogJ2JldmVyYWdlcycsXG4gICAgICAgIHN1Yjoge1xuICAgICAgICAgICAgMToge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdhbGNvaG9saWMnLFxuICAgICAgICAgICAgICAgIHBhbGVvOiBmYWxzZSxcbiAgICAgICAgICAgICAgICBzdWI6IHtcbiAgICAgICAgICAgICAgICAgICAgMToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2JlZXInXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIDI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdkaXN0aWxsZWQnXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIDM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdsaXF1b3InXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIDQ6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICd3aW5lJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDI6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnY29mZmVlJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDM6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAndGVhJ1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICAzOiB7XG4gICAgICAgIG5hbWU6ICdjZXJlYWwgZ3JhaW5zIGFuZCBwYXN0YScsXG4gICAgICAgIHBhbGVvOiBmYWxzZVxuICAgIH0sXG4gICAgNDoge1xuICAgICAgICBuYW1lOiAnZGFpcnkgYW5kIGVnZycsXG4gICAgICAgIHN1Yjoge1xuICAgICAgICAgICAgMToge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdkYWlyeScsXG4gICAgICAgICAgICAgICAgcGFsZW86IGZhbHNlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMjoge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdlZ2cnXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIDU6IHtcbiAgICAgICAgbmFtZTogJ2ZhdHMgYW5kIG9pbHMnXG4gICAgfSxcbiAgICA2OiB7XG4gICAgICAgIG5hbWU6ICdmaXNoIGFuZCBzaGVsbGZpc2gnXG4gICAgfSxcbiAgICA3OiB7XG4gICAgICAgIG5hbWU6ICdmcnVpdHMgYW5kIGp1aWNlcydcbiAgICB9LFxuICAgIDg6IHtcbiAgICAgICAgbmFtZTogJ2xlZ3VtZXMnLFxuICAgICAgICBwYWxlbzogZmFsc2VcbiAgICB9LFxuICAgIDk6IHtcbiAgICAgICAgbmFtZTogJ21lYXQnLFxuICAgICAgICBzdWI6IHtcbiAgICAgICAgICAgIDE6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnYmVlZidcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAyOiB7XG4gICAgICAgICAgICAgICAgbmFtZTogJ3BvcmsnXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgMzoge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdwb3VsdHJ5JyxcbiAgICAgICAgICAgICAgICBzdWI6IHtcbiAgICAgICAgICAgICAgICAgICAgMToge1xuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ2NoaWNrZW4nXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIDI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICd0dXJrZXknXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIDM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5hbWU6ICdkdWNrJ1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICA0OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiAnZ29vc2UnXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgNDoge1xuICAgICAgICAgICAgICAgIG5hbWU6ICdsYW1iJ1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIDU6IHtcbiAgICAgICAgICAgICAgICBuYW1lOiAnZ2FtZSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgMTA6IHtcbiAgICAgICAgbmFtZTogJ251dHMgYW5kIHNlZWRzJ1xuICAgIH0sXG4gICAgMTE6IHtcbiAgICAgICAgbmFtZTogJ3NwaWNlcyBhbmQgaGVyYnMnXG4gICAgfSxcbiAgICAxMjoge1xuICAgICAgICBuYW1lOiAndmVnZXRhYmxlcydcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgICBjYXRlZ29yaWVzOiBjYXRlZ29yaWVzLFxuICAgIHNob3J0OiBzaG9ydFxufTsiLCIndXNlIHN0cmljdCc7XG5cbnZhciBjcyA9IHtcblx0bG9nOiBmdW5jdGlvbiBsb2codGV4dCkge1xuXHRcdGNvbnNvbGUubG9nKHRleHQpO1xuXHR9LFxuXHRnZXQ6IGZ1bmN0aW9uIGdldCh1cmwsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG5cdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuXHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0dmFyIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlID8gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpIDogbnVsbDtcblx0XHRcdFx0XHRjYWxsYmFjayh4aHIuc3RhdHVzLCByZXNwb25zZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoeGhyLnN0YXR1cyA9PT0gNDA0KSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignYWpheCBnZXQgZXJyb3InKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0eGhyLm9wZW4oJ0dFVCcsIHVybCk7XG5cdFx0eGhyLnNlbmQoKTtcblx0fSxcblx0cG9zdDogZnVuY3Rpb24gcG9zdCh1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG5cdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuXHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0dmFyIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlID8gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpIDogbnVsbDtcblx0XHRcdFx0XHRjYWxsYmFjayh4aHIuc3RhdHVzLCByZXNwb25zZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoeGhyLnN0YXR1cyA9PT0gNDA0KSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignYWpheCBwb3N0IGVycm9yJyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXHRcdHhoci5vcGVuKCdQT1NUJywgdXJsKTtcblx0XHR4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC10eXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcblx0XHR4aHIuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cdH0sXG5cdGNvb2tpZTogZnVuY3Rpb24gY29va2llKG5hbWUsIGNvb2tpZXMpIHtcblx0XHR2YXIgYyA9IHRoaXMuY29va2llcyhjb29raWVzKTtcblx0XHRyZXR1cm4gY1tuYW1lXTtcblx0fSxcblx0Y29va2llczogZnVuY3Rpb24gY29va2llcyhfY29va2llcykge1xuXHRcdHZhciBuYW1lVmFsdWVzID0gX2Nvb2tpZXMuc3BsaXQoJzsgJyk7XG5cdFx0dmFyIHJlc3VsdCA9IHt9O1xuXHRcdG5hbWVWYWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0dmFyIGkgPSBpdGVtLnNwbGl0KCc9Jyk7XG5cdFx0XHRyZXN1bHRbaVswXV0gPSBpWzFdO1xuXHRcdH0pO1xuXHRcdHJldHVybiByZXN1bHQ7XG5cdH0sXG5cdGdldFF1ZXJ5VmFsdWU6IGZ1bmN0aW9uIGdldFF1ZXJ5VmFsdWUocXVlcnlTdHJpbmcsIG5hbWUpIHtcblx0XHR2YXIgYXJyID0gcXVlcnlTdHJpbmcubWF0Y2gobmV3IFJlZ0V4cChuYW1lICsgJz0oW14mXSspJykpO1xuXG5cdFx0aWYgKGFycikge1xuXHRcdFx0cmV0dXJuIGFyclsxXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHR9XG59O1xuXG52YXIgdGVzdHMgPSBbe1xuXHRpZDogMSxcblx0dGVzdDogZnVuY3Rpb24gdGVzdCgpIHtcblx0XHR2YXIgY29va2llcyA9IHtcblx0XHRcdGNzYXRpOiAnbWFqb20nLFxuXHRcdFx0b25lOiAndHdvJ1xuXHRcdH07XG5cblx0XHR2YXIgcmVzdWx0ID0gdHJ1ZTtcblxuXHRcdHZhciBjID0gY3MuY29va2llcygnY3NhdGk9bWFqb207IG9uZT10d28nKTtcblxuXHRcdGlmIChjLmNzYXRpICE9PSBjb29raWVzLmNzYXRpKSByZXN1bHQgPSBmYWxzZTtcblxuXHRcdHJldHVybiByZXN1bHQ7XG5cdH1cbn0sIHtcblx0aWQ6IDIsXG5cdHRlc3Q6IGZ1bmN0aW9uIHRlc3QoKSB7XG5cdFx0cmV0dXJuICdiYXInID09PSBjcy5jb29raWUoJ2ZvbycsICdmb289YmFyOyB0ZT1tYWpvbScpO1xuXHR9XG59LCB7XG5cdGlkOiAzLFxuXHR0ZXN0OiBmdW5jdGlvbiB0ZXN0KCkge1xuXHRcdHJldHVybiAnMTIzJyA9PT0gY3MuZ2V0UXVlcnlWYWx1ZSgnP2NzYXRpPW1ham9tJnVzZXJfaWQ9MTIzJnZhbGFtaT1zZW1taScsICd1c2VyX2lkJyk7XG5cdH1cbn1dO1xuXG5pZiAoZmFsc2UpIHtcblx0dmFyIHJlc3VsdCA9IHRydWU7XG5cdHRlc3RzLmZvckVhY2goZnVuY3Rpb24gKHRlc3QpIHtcblx0XHRpZiAoIXRlc3QudGVzdCgpKSB7XG5cdFx0XHRjb25zb2xlLmVycm9yKHRlc3QuaWQgKyAnLiB0ZXN0IGZhaWxlZCcpO1xuXHRcdFx0cmVzdWx0ID0gZmFsc2U7XG5cdFx0fVxuXHR9KTtcblx0aWYgKHJlc3VsdCkge1xuXHRcdGNvbnNvbGUubG9nKCdBbGwgdGVzdHMgc3VjY2VlZGVkIScpO1xuXHR9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gY3M7IiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgbnV0cmllbnRzID0ge1xuXHQnZW5lcmd5JzogJzIwOCcsXG5cdCdwcm90ZWluJzogJzIwMycsXG5cdCdmYXQnOiAnMjA0Jyxcblx0J2NhcmJvaHlkcmF0ZSc6ICcyMDUnLFxuXHQnZmliZXInOiAnMjkxJyxcblx0J3N1Z2FyJzogJzI2OScsXG5cdCdDYSc6ICczMDEnLFxuXHQnRmUnOiAnMzAzJyxcblx0J01nJzogJzMwNCcsXG5cdCdQJzogJzMwNScsXG5cdCdLJzogJzMwNicsXG5cdCdOYSc6ICczMDcnLFxuXHQnWm4nOiAnMzA5Jyxcblx0J0N1JzogJzMxMicsXG5cdCdNbic6ICczMTUnLFxuXHQnU2UnOiAnMzE3Jyxcblx0J0YnOiAnMzEzJyxcblx0J3ZfYSc6ICczMTgnLFxuXHQndl9iNic6ICc0MTUnLFxuXHQndl9iMTInOiAnNDE4Jyxcblx0J3ZfYyc6ICc0MDEnLFxuXHQndl9kMyc6ICczMjYnLFxuXHQndl9lJzogJzMyMycsXG5cdCd2X2snOiAnNDMwJyxcblx0J2ZhdHR5X2FjaWRzX3RvdGFsX3NhdHVyYXRlZCc6ICc2MDYnLFxuXHQnZmF0dHlfYWNpZHNfdG90YWxfbW9ub3Vuc2F0dXJhdGVkJzogJzY0NScsXG5cdCdmYXR0eV9hY2lkc190b3RhbF9wb2x5dW5zYXR1cmF0ZWQnOiAnNjQ2Jyxcblx0J2ZhdHR5X2FjaWRzX3RvdGFsX3RyYW5zJzogJzYwNScsXG5cdCdEUEEnOiAnNjMxJyxcblx0J0RIQSc6ICc2MjEnLFxuXHQnY2hvbGVzdGVyb2wnOiAnNjAxJyxcblx0J2FsY29ob2xfZXRoeWwnOiAnMjIxJyxcblx0J2NhZmZlaW5lJzogJzI2Midcbn07XG5cbnZhciBmb29kR3JvdXBzID0ge1xuXHQnZWdnJzogJzEnLFxuXHQnc3BpY2VzX2FuZF9oZXJicyc6ICcyJyxcblx0J2JhYnlfZm9vZHMnOiAnMycsXG5cdCdmYXRzX2FuZF9vaWxzJzogJzQnLFxuXHQncG91bHRyeSc6ICc1Jyxcblx0J3NvdXBzX3NhdWNlc19hbmRfZ3Jhdmllcyc6ICc2Jyxcblx0J3NhdXNhZ2VzX2FuZF9sdW5jaGVvbl9tZWF0cyc6ICc3Jyxcblx0J2JyZWFrZmFzdF9jZXJlYWxzJzogJzgnLFxuXHQnZnJ1aXRzX2FuZF9mcnVpdF9qdWljZXMnOiAnOScsXG5cdCdwb3JrJzogJzEwJyxcblx0J3ZlZ2V0YWJsZXMnOiAnMTEnLFxuXHQnbnV0c19hbmRfc2VlZHMnOiAnMTInLFxuXHQnYmVlZic6ICcxMycsXG5cdCdiZXZlcmFnZXMnOiAnMTQnLFxuXHQnZmlzaF9hbmRfc2hlbGxmaXNoJzogJzE1Jyxcblx0J2xlZ3VtZXMnOiAnMTYnLFxuXHQnbGFtYl92ZWFsX2FuZF9nYW1lJzogJzE3Jyxcblx0J2Jha2VkX3Byb2R1Y3RzJzogJzE4Jyxcblx0J3N3ZWV0cyc6ICcxOScsXG5cdCdjZXJlYWxfZ3JhaW5zX2FuZF9wYXN0YSc6ICcyMCcsXG5cdCdmYXN0X2Zvb2RzJzogJzIxJyxcblx0J21lYWxzX2VudHJlZXNfYW5kX3NpZGVfZGlzaGVzJzogJzIyJ1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSB7XG5cdG51dHJpZW50czogbnV0cmllbnRzLFxuXHRmb29kR3JvdXBzOiBmb29kR3JvdXBzLFxuXHRhcGlLZXk6ICdQWXphNmo1VzZNMkNxODYzc3ZKeGl6MXA4cVYycW9HQ2dHZjBTeUg0J1xufTsiXX0=
