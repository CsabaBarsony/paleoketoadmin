/** @jsx React.DOM */

var React = require("react");
var Router = require('react-router');
var DefaultRoute = Router.DefaultRoute;
var NotFoundRoute = Router.NotFoundRoute;
var Link = Router.Link;
var Route = Router.Route;
var RouteHandler = Router.RouteHandler;
var Home = require("./components/home");
var Example = require("./components/example");
var About= require("./components/about");
var NotFound = require("./components/not_found");
var auth = require("./helpers/auth");

var App = React.createClass({
	getInitialState: function(){
		return { auth: "authorizing" };
	},
	componentDidMount: function(){
		console.log('here comes the arrow');
		auth.authorize((result) => {
			if(result) {
				this.setState({ auth: "authorized" });
				console.log('in arrow', this);
			}
			else window.location.href = auth.loginPage;
		});
	},
	logout: function(){
		this.setState({ auth: "loggingOut" });
		auth.logout(function(){
			window.location.href = auth.loginPage;
		});
	},
	render: function () {
		if(this.state.auth === "authorizing") return <h1>Authorizing...</h1>;
		else if(this.state.auth === "loggingOut") return <h1>Logging out...</h1>
		else if(this.state.auth === "authorized"){
			return (
				<div>
					<header>
						<ul>
							<li><Link to="home">Home</Link></li>
							<li><Link to="example">Example</Link></li>
							<li><Link to="about">About</Link></li>
							<li>
								<a href="#" onClick={this.logout}>Logout</a>
							</li>
						</ul>
						<div>
							<p>user: {auth.getUsername()}</p>
						</div>
					</header>
					<RouteHandler/>
				</div>
			);
		}
	}
});

var routes = (
	<Route name="home" path="/" handler={App}>
		<Route name="example" handler={Example}/>
		<Route name="about" handler={About}/>
		<DefaultRoute handler={Home}/>
		<NotFoundRoute handler={NotFound}/>
	</Route>
);

Router.run(routes, function(Handler) {
	React.render(<Handler/>, document.body);
});
