var cs = require('../helpers/cs');
var server = require('../server');

var QuestListPage = React.createClass({
	getInitialState: function() {
		return { loggedIn: bella.data.user.get().status === bella.constants.userStatus.LOGGED_IN }
	},
	componentDidMount: function() {
		bella.data.user.subscribe((user) => {
			this.setState({ loggedIn: user.status === bella.constants.userStatus.LOGGED_IN });
		});
	},
	render: function() {
		return (
			<div className="bc-quest-list-page">
				<h1>Quests</h1>
				<QuestList loggedIn={this.state.loggedIn} />
			</div>
		);
	}
});

var QuestList = React.createClass({
	getInitialState: function() {
		return { questList: {} }
	},
	componentDidMount: function() {
		server.wishList.get((result, wishList) => {
			this.setState({ questList: wishList });
		});
	},
	render: function() {
		var questList = _.map(this.state.questList, function(quest, key) {
			return (
				<Quest
					key={key}
					questId={quest.id}
					title={quest.title}
					description={quest.description} />
			);
		});

		var newWish = this.props.loggedIn ? (<div><a href="/quest.html">New Quest</a></div>) : null;

		return (
			<div className="bc-quest-list">
				{newWish}
				{questList}
			</div>
		);
	}
});

var Quest = React.createClass({
	render: function() {
		var link = '/quest.html?quest_id=' + this.props.questId;

		return (
			<div className="bc-quest">
				<div><span>title: </span><a href={link}>{this.props.title}</a></div>
			</div>
		);
	}
});

ReactDOM.render(
	<QuestListPage />,
	document.getElementById('main-section')
);
