var nutrients = require('../../nutrients');
var cs = require('../../helpers/cs');

var HomePage = React.createClass({
	getInitialState: function() {
		return { status: 'init', foods: [] };
	},
	componentDidMount: function() {
		bella.data.user.subscribe((user) => {
			// do what you want!
		});
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
					var buttons, name, description, category, paleoOptions, ketoOptions, show;

					if(this.state.editingFoodId) {
						if(this.state.editingFoodId === food.ndbno) {
							buttons = (
								<div>
									<button onClick={this.save}>Save</button>
									<button onClick={this.cancel}>Cancel</button>
								</div>
							);

							category = (
								<select ref="categorySelect">
									<option value="0">choose one...</option>
									{getCategoryOptions()}
								</select>
							);

							paleoOptions = (
								<select ref="paleoSelect">
									{getPaleoKetoOptions(food.paleo)}
								</select>
							);

							ketoOptions = (
								<select ref="ketoSelect">
									{getPaleoKetoOptions(food.keto)}
								</select>
							);

							name = (<input type="text" ref="nameInput" />);
							description = (<input type="text" ref="descriptionInput" />);
							show = (<input type="checkbox" ref="showCheckbox" />);
						}
						else {
							buttons = (<div>...</div>);
							category = (<span>{food.category}</span>);
							paleoOptions = (<span>{food.paleo}</span>);
							ketoOptions = (<span>{food.keto}</span>);
							name = (<span>{food.name}</span>);
							description = (<span>{food.description}</span>);
							show = (<input type="checkbox" ref="showCheckbox" disabled={true} />);
						}
					}
					else {
						buttons = (
							<div>
								<button onClick={this.editFood.bind(this, food.ndbno)}>Edit</button>
							</div>
						);
						category = (<span>{food.category}</span>);
						paleoOptions = (<span>{food.paleo}</span>);
						ketoOptions = (<span>{food.keto}</span>);
						name = (<span>{food.name}</span>);
						description = (<span>{food.description}</span>);
						show = (<input type="checkbox" ref="showCheckbox" disabled={true} />);
					}

					return (
						<tr key={key}>
							<td>{food.original_name}</td>
							<td>{name}</td>
							<td>{description}</td>
							<td>{category}</td>
							<td>{paleoOptions}</td>
							<td>{ketoOptions}</td>
							<td>{show}</td>
							<td>{buttons}</td>
						</tr>
					);
				});
				break;
		}

		function getOptions() {
			return _.map(nutrients.foodGroups, function(foodGroup, key) {
				return (<option key={foodGroup} value={foodGroup}>{key}</option>);
			});
		}

		function getPaleoKetoOptions(defaultValue) {
			return _.map([10, 5, 1], function(value) {
				return (<option key={value} value={value}>{value}</option>);
			});
		}
		
		function getCategoryOptions() {
			return _.map(require('../../food').short, function(food, key) {
				return (<option key={key} value={food[0]}>{food[0] + '\t' + food[1]}</option>);
			});
		}

		return (
			<div className="bc-home-page">
				<select onChange={this.selectChange}>
					<option value="0">...</option>
					{getOptions()}
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
							<th>show</th>
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
	selectChange: function(e) {
		this.getNutrientData(e.target.value);
		this.setState({ status: 'loading', editingFoodId: false });
	},
	editFood: function(foodId) {
		this.setState({ editingFoodId: foodId });
	},
	save: function() {
		console.log(this.refs.descriptionInput.value);
	},
	cancel: function() {
		this.setState({ editingFoodId: false });
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
