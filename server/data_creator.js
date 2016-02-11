var _ = require('lodash');

//******** database api query ***********

var url = 'http://api.nal.usda.gov/ndb/nutrients/?format=json' +
	'&api_key=' + nutrients.apiKey +

	'&nutrients=' + nutrients.nutrients.energy +
	'&nutrients=' + nutrients.nutrients.protein +
	'&nutrients=' + nutrients.nutrients.fat +
	'&nutrients=' + nutrients.nutrients.carbohydrate +
	'&nutrients=' + nutrients.nutrients.sugar +
	'&nutrients=' + nutrients.nutrients.fiber +
	'&nutrients=' + nutrients.nutrients.Mg +
	'&nutrients=' + nutrients.nutrients.Ca +
	'&nutrients=' + nutrients.nutrients.Fe +
	'&nutrients=' + nutrients.nutrients.v_a +
	'&nutrients=' + nutrients.nutrients.v_b6 +
	'&nutrients=' + nutrients.nutrients.v_b12 +
	'&nutrients=' + nutrients.nutrients.v_c +
	'&nutrients=' + nutrients.nutrients.v_d3 +
	'&nutrients=' + nutrients.nutrients.v_e +
	'&nutrients=' + nutrients.nutrients.v_k +
	'&nutrients=' + nutrients.nutrients.fatty_acids_total_saturated +
	'&nutrients=' + nutrients.nutrients.fatty_acids_total_monounsaturated +
	'&nutrients=' + nutrients.nutrients.fatty_acids_total_polyunsaturated +
	'&nutrients=' + nutrients.nutrients.fatty_acids_total_trans +

	'&fg=' + foodGroup +
	'&max=1000';

//******** Copy to server.js ***********

var reports = [];

reports.push(require('../data/1_egg').report);
reports.push(require('../data/2_spices').report);
reports.push(require('../data/3_baby').report);
reports.push(require('../data/4_fats').report);
reports.push(require('../data/5_poultry').report);
reports.push(require('../data/6_soup').report);
reports.push(require('../data/7_sausages').report);
reports.push(require('../data/8_cereals').report);
reports.push(require('../data/9_fruits').report);
reports.push(require('../data/10_pork').report);
reports.push(require('../data/11_vegetables').report);
reports.push(require('../data/12_nuts').report);
reports.push(require('../data/13_beef').report);
reports.push(require('../data/14_beverages').report);
reports.push(require('../data/15_fish').report);
reports.push(require('../data/16_legumes').report);
reports.push(require('../data/17_lamb').report);
reports.push(require('../data/18_baked').report);
reports.push(require('../data/19_sweets').report);
reports.push(require('../data/20_cereal').report);
reports.push(require('../data/21_fast').report);
reports.push(require('../data/22_entree').report);

var dataCreator = require('./data_creator');

_.each(reports, function(report) {
	console.log('starting food group ' + report.groups[0].description);
	_.each(report.foods, function(food) {
		db.query(dataCreator.getQueryString(food, report.groups[0].id), function(err) {
			if(err) console.log(err);
		});
	});
});

module.exports = {
	getQueryString: function(food, groupId) {
		var nutrients = {};
		_.each(food.nutrients, function(nutrient) {
			if(nutrient.value === '--') nutrient.value = 0;
			if(nutrient.gm === '--') nutrient.gm = 0;
			nutrients[nutrient.nutrient_id] = nutrient;
		});

		return "INSERT INTO `nutrients` (`id`, `name`, `description`, `category`, `paleo`, `keto`, `original_name`, `food_group_id`, `ndbno`, `measure`, `weight`, `energy_v`, `energy_m`, `protein_v`, `protein_m`, `fat_v`, `fat_m`, `ch_v`, `ch_m`, `fiber_v`, `fiber_m`, `sugar_v`, `sugar_m`, `ca_v`, `ca_m`, `fe_v`, `fe_m`, `mg_v`, `mg_m`, `p_v`, `p_m`, `k_v`, `k_m`, `na_v`, `na_m`, `zn_v`, `zn_m`, `cu_v`, `cu_m`, `mn_v`, `mn_m`, `se_v`, `se_m`, `f_v`, `f_m`, `v_a_v`, `v_a_m`, `v_b6_v`, `v_b6_m`, `v_b12_v`, `v_b12_m`, `v_c_v`, `v_c_m`, `v_d3_v`, `v_d3_m`, `v_e_v`, `v_e_m`, `v_k_v`, `v_k_m`, `fatty_a_saturated_v`, `fatty_a_saturated_m`, `fatty_a_mono_v`, `fatty_a_mono_m`, `fatty_a_poly_v`, `fatty_a_poly_m`, `fatty_a_trans_v`, `fatty_a_trans_m`, `dpa_v`, `dpa_m`, `dha_v`, `dha_m`, `cholesterol_v`, `cholesterol_m`, `alcohol_v`, `alcohol_m`, `caffeine_v`, `caffeine_m`) VALUES (NULL, NULL, NULL, NULL, NULL, NULL, '" +
			food.name + "', " +
			groupId + ", '" +
			food.ndbno + "', '" +
			food.measure + "', '" +
			food.weight + "', " +

			+ nutrients['208'].value + ", " +
			+ nutrients['208'].gm + ", " +

			+ nutrients['203'].value + ", " +
			+ nutrients['203'].gm + ", " +

			+ nutrients['204'].value + ", " +
			+ nutrients['204'].gm + ", " +

			+ nutrients['205'].value + ", " +
			+ nutrients['205'].gm + ", " +

			+ nutrients['291'].value + ", " +
			+ nutrients['291'].gm + ", " +

			+ nutrients['269'].value + ", " +
			+ nutrients['269'].gm + ", " +

			+ nutrients['301'].value + ", " +
			+ nutrients['301'].gm + ", " +

			+ nutrients['303'].value + ", " +
			+ nutrients['303'].gm + ", " +

			+ nutrients['304'].value + ", " +
			+ nutrients['304'].gm + ", " +

				"NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, "

			+ nutrients['318'].value + ", " +
			+ nutrients['318'].gm + ", " +

			+ nutrients['415'].value + ", " +
			+ nutrients['415'].gm + ", " +

			+ nutrients['418'].value + ", " +
			+ nutrients['418'].gm + ", " +

			+ nutrients['401'].value + ", " +
			+ nutrients['401'].gm + ", " +

			+ nutrients['326'].value + ", " +
			+ nutrients['326'].gm + ", " +

			+ nutrients['323'].value + ", " +
			+ nutrients['323'].gm + ", " +

			+ nutrients['430'].value + ", " +
			+ nutrients['430'].gm + ", " +

			+ nutrients['606'].value + ", " +
			+ nutrients['606'].gm + ", " +

			+ nutrients['645'].value + ", " +
			+ nutrients['645'].gm + ", " +

			+ nutrients['646'].value + ", " +
			+ nutrients['646'].gm + ", " +

			+ nutrients['605'].value + ", " +
			+ nutrients['605'].gm + ", " +

			"NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);";
	}
};