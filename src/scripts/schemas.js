//var _ = require('lodash');

var food = {
	client: {
		type: 'object',
		properties: {
			name: { type: 'string', minLength: 3 },
			description: { type: 'string', minLength: 3 },
			category: { type: 'string', minLength: 1 },
			paleo: { type: 'integer', eq: [1, 5, 10] },
			keto: { type: 'integer', eq: [1, 5, 10] },
			show: { type: 'boolean' }
		}
	}
};

var wish = {
	blank: function(user) {
		return {
			user: user,
			title: '',
			description: '',
			dirty: true
		}
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
	clientToServer: function(obj) {
		var wish = {
			user: obj.user,
			description: obj.description,
			title: obj.title
		};
		if(obj.id) wish.id = obj.id;
		return wish;
	},
	serverToClient: function(obj) {
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
	blank: function() {
		return {
			id: null,
			name: '',
			status: bella.constants.userStatus.GUEST
		}
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
	clientToServer: function(obj) {

	},
	serverToClient: function(obj) {

	}
};

module.exports = {
	wish: wish,
	wishList: wishList,
	user: user,
	food: food
};
