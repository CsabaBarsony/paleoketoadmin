window.DEBUG_MODE = false;
var nutrients = require('../../nutrients');
var cs = require('../../helpers/cs');
var server = require('../../server');
var foodShort = require('../../food').short;

var HomePage = React.createClass({
	getInitialState: function() {
		return {
			status: 'init',
			foods: []
		};
	},
	render: function() {
		var list;

		switch(this.state.status) {
			case 'init':
				list = (
					<tr>
						<td>Select a food category!</td>
					</tr>
				);
				break;
			case 'loading':
				list = (
					<tr>
						<td>Loading...</td>
					</tr>
				);
				break;
			case 'ready':
				list = _.map(this.state.foods, (food, key) => {
					var buttons, name, description, category, paleoOptions, ketoOptions, enabled;

					if(this.state.selectedFoodId) {
						if(this.state.selectedFoodId === food.id) {
							buttons = (
								<div>
									<button onClick={this.save}>Save</button>
									<button onClick={this.cancel}>Cancel</button>
								</div>
							);

							category = (
								<select ref="categorySelect" defaultValue={food.category}>
									<option value="">choose one...</option>
									{getCategoryOptions()}
								</select>
							);

							paleoOptions = (
								<select ref="paleoSelect" defaultValue={food.paleo}>
									{getPaleoKetoOptions(food.paleo)}
								</select>
							);

							ketoOptions = (
								<select ref="ketoSelect" defaultValue={food.keto}>
									{getPaleoKetoOptions(food.keto)}
								</select>
							);

							name = (<input type="text" ref="nameInput" defaultValue={food.name} />);
							description = (<input type="text" ref="descriptionInput" defaultValue={food.description}  />);
							enabled = (
								<input
									type="checkbox"
									defaultChecked={food.enabled}
									ref="enabledCheckbox" />
							);
						}
						else {
							buttons = (<div></div>);
							category = (<span>{_.find(foodShort, (short) => short[0] === food.category)}</span>);
							paleoOptions = (<span>{food.paleo}</span>);
							ketoOptions = (<span>{food.keto}</span>);
							name = (<span>{food.name}</span>);
							description = (<span>{food.description}</span>);
							enabled = (
								<input
									type="checkbox"
									defaultChecked={food.enabled}
									disabled={true} />
							);
						}
					}
					else {
						buttons = (
							<div>
								<button onClick={this.editFood.bind(this, food.id)}>Edit</button>
							</div>
						);
						category = (<span>{_.find(foodShort, (short) => short[0] === food.category)}</span>);
						paleoOptions = (<span>{food.paleo}</span>);
						ketoOptions = (<span>{food.keto}</span>);
						name = (<span>{food.name}</span>);
						description = (<span>{food.description}</span>);
						enabled = (
							<input
								type="checkbox"
								defaultChecked={food.enabled}
								disabled={true} />
						);
					}

					return (
						<tr key={key}>
							<td>{food.original_name}</td>
							<td>{name}</td>
							<td>{description}</td>
							<td>{category}</td>
							<td>{paleoOptions}</td>
							<td>{ketoOptions}</td>
							<td>{enabled}</td>
							<td>{buttons}</td>
						</tr>
					);
				});
				break;
		}

		function getFoodGroupOptions() {
			return _.map(nutrients.foodGroups, function(foodGroup, key) {
				return (<option key={foodGroup} value={foodGroup}>{key}</option>);
			});
		}

		function getPaleoKetoOptions() {
			return _.map([10, 5, 1], function(value) {
				return (<option key={value} value={value}>{value}</option>);
			});
		}
		
		function getCategoryOptions() {
			return _.map(foodShort, function(food, key) {
				return (<option key={key} value={food[0]}>{food[0] + '\t' + food[1]}</option>);
			});
		}

		return (
			<div className="bc-home-page">
				<select onChange={this.selectFoodGroupChange}>
					<option value="0">...</option>
					{getFoodGroupOptions()}
				</select>
				<table>
					<thead>
						<tr>
							<th>originalName</th>
							<th>name</th>
							<th>description</th>
							<th>category</th>
							<th>paleo</th>
							<th>keto</th>
							<th>enabled</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						{list}
					</tbody>
				</table>
			</div>
		);
	},
	selectFoodGroupChange: function(e) {
		this.getNutrientData(e.target.value);
		this.setState({
			status: 'loading',
			selectedFoodId: false,
			selectedFoodGroupId: e.target.value
		});
	},
	editFood: function(id) {
		this.setState({ selectedFoodId: id });
	},
	save: function() {
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
		server.food.post(food, (valid, error) => {
			if(valid) {
				var foods = _.clone(this.state.foods);
				var editedFood = _.find(foods, (f) => food.id === f.id);
				_.merge(editedFood, food);
				this.setState({
					selectedFoodId: false,
					status: 'ready',
					foods: foods
				});
			}
			else {
				var message = 'Error! \n';
				_.each(error, (e) => message += e.property + ': ' + e.message + '\n');
				alert(message);
				this.setState({ status: 'ready' });
			}
		});
	},
	cancel: function() {
		this.setState({ selectedFoodId: false });
	},
	getNutrientData: function(foodGroup) {
		cs.get('/foods/' + foodGroup , (status, foods) => {
			this.setState({ status: 'ready', foods: foods });
		});
	}
});

ReactDOM.render(
	<HomePage />,
	document.getElementById('main-section')
);
