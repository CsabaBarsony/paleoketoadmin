module.exports = {
	quest: function(user, quest) {
		var result = {
			user: {
				id: user.id,
				name: user.name
			}
		};

		if(quest) {
			result.id = quest.id;
			result.title = quest.title;
			result.description= quest.description;
			result.dirty = false;
		}
		else {
			result.id = null;
			result.title = '';
			result.description = '';
			result.dirty = true;
		}

		return result;
	}
};
