(function() {
	var data = {};
	var dataStore = {};
	var constants = {
		event: {
			USER_STATUS_CHANGE: 'USER_STATUS_CHANGE'
		},
		userStatus: {
			GUEST: 'GUEST',
			LOGGED_IN: 'LOGGED_IN'
		},
		response: {
			OK: 200,
			NOT_FOUND: 404
		}
	};

	function createData(dataName, dataValue) {
		if(data[dataName]) return;

		dataStore[dataName] = {
			data: dataValue,
			callbacks: []
		};

		data[dataName] = {
			get: function() {
				return dataStore[dataName].data;
			},
			set: function(value, emitter) {
				_.merge(dataStore[dataName].data, value);
				dataStore[dataName].callbacks.forEach((callback) => callback(dataStore[dataName].data, emitter));
			},
			subscribe: function(callback) {
				dataStore[dataName].callbacks.push(callback);
			}
		}
	}

	createData('user', {
		id: null,
		name: '',
		status: constants.userStatus.GUEST
	});

	window.bella = {
		constants: constants,
		data: data
	};
})();
