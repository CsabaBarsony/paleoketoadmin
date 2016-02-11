(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

(function () {
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
		if (data[dataName]) return;

		dataStore[dataName] = {
			data: dataValue,
			callbacks: []
		};

		data[dataName] = {
			get: function get() {
				return dataStore[dataName].data;
			},
			set: function set(value, emitter) {
				_.merge(dataStore[dataName].data, value);
				dataStore[dataName].callbacks.forEach(function (callback) {
					return callback(dataStore[dataName].data, emitter);
				});
			},
			subscribe: function subscribe(callback) {
				dataStore[dataName].callbacks.push(callback);
			}
		};
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjL3NjcmlwdHMvYmVsbGEvYmVsbGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG4oZnVuY3Rpb24gKCkge1xuXHR2YXIgZGF0YSA9IHt9O1xuXHR2YXIgZGF0YVN0b3JlID0ge307XG5cdHZhciBjb25zdGFudHMgPSB7XG5cdFx0ZXZlbnQ6IHtcblx0XHRcdFVTRVJfU1RBVFVTX0NIQU5HRTogJ1VTRVJfU1RBVFVTX0NIQU5HRSdcblx0XHR9LFxuXHRcdHVzZXJTdGF0dXM6IHtcblx0XHRcdEdVRVNUOiAnR1VFU1QnLFxuXHRcdFx0TE9HR0VEX0lOOiAnTE9HR0VEX0lOJ1xuXHRcdH0sXG5cdFx0cmVzcG9uc2U6IHtcblx0XHRcdE9LOiAyMDAsXG5cdFx0XHROT1RfRk9VTkQ6IDQwNFxuXHRcdH1cblx0fTtcblxuXHRmdW5jdGlvbiBjcmVhdGVEYXRhKGRhdGFOYW1lLCBkYXRhVmFsdWUpIHtcblx0XHRpZiAoZGF0YVtkYXRhTmFtZV0pIHJldHVybjtcblxuXHRcdGRhdGFTdG9yZVtkYXRhTmFtZV0gPSB7XG5cdFx0XHRkYXRhOiBkYXRhVmFsdWUsXG5cdFx0XHRjYWxsYmFja3M6IFtdXG5cdFx0fTtcblxuXHRcdGRhdGFbZGF0YU5hbWVdID0ge1xuXHRcdFx0Z2V0OiBmdW5jdGlvbiBnZXQoKSB7XG5cdFx0XHRcdHJldHVybiBkYXRhU3RvcmVbZGF0YU5hbWVdLmRhdGE7XG5cdFx0XHR9LFxuXHRcdFx0c2V0OiBmdW5jdGlvbiBzZXQodmFsdWUsIGVtaXR0ZXIpIHtcblx0XHRcdFx0Xy5tZXJnZShkYXRhU3RvcmVbZGF0YU5hbWVdLmRhdGEsIHZhbHVlKTtcblx0XHRcdFx0ZGF0YVN0b3JlW2RhdGFOYW1lXS5jYWxsYmFja3MuZm9yRWFjaChmdW5jdGlvbiAoY2FsbGJhY2spIHtcblx0XHRcdFx0XHRyZXR1cm4gY2FsbGJhY2soZGF0YVN0b3JlW2RhdGFOYW1lXS5kYXRhLCBlbWl0dGVyKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9LFxuXHRcdFx0c3Vic2NyaWJlOiBmdW5jdGlvbiBzdWJzY3JpYmUoY2FsbGJhY2spIHtcblx0XHRcdFx0ZGF0YVN0b3JlW2RhdGFOYW1lXS5jYWxsYmFja3MucHVzaChjYWxsYmFjayk7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdGNyZWF0ZURhdGEoJ3VzZXInLCB7XG5cdFx0aWQ6IG51bGwsXG5cdFx0bmFtZTogJycsXG5cdFx0c3RhdHVzOiBjb25zdGFudHMudXNlclN0YXR1cy5HVUVTVFxuXHR9KTtcblxuXHR3aW5kb3cuYmVsbGEgPSB7XG5cdFx0Y29uc3RhbnRzOiBjb25zdGFudHMsXG5cdFx0ZGF0YTogZGF0YVxuXHR9O1xufSkoKTsiXX0=
