(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
				} else if (xhr.status < 500) {
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
				} else if (xhr.status < 500) {
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
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlc1xcYnJvd3NlcmlmeVxcbm9kZV9tb2R1bGVzXFxicm93c2VyLXBhY2tcXF9wcmVsdWRlLmpzIiwic3JjL3NjcmlwdHMvaGVscGVycy9jcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIGNzID0ge1xuXHRsb2c6IGZ1bmN0aW9uIGxvZyh0ZXh0KSB7XG5cdFx0Y29uc29sZS5sb2codGV4dCk7XG5cdH0sXG5cdGdldDogZnVuY3Rpb24gZ2V0KHVybCwgY2FsbGJhY2spIHtcblx0XHR2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cblx0XHR4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKHhoci5yZWFkeVN0YXRlID09PSBYTUxIdHRwUmVxdWVzdC5ET05FKSB7XG5cdFx0XHRcdGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcblx0XHRcdFx0XHR2YXIgcmVzcG9uc2UgPSB4aHIucmVzcG9uc2UgPyBKU09OLnBhcnNlKHhoci5yZXNwb25zZSkgOiBudWxsO1xuXHRcdFx0XHRcdGNhbGxiYWNrKHhoci5zdGF0dXMsIHJlc3BvbnNlKTtcblx0XHRcdFx0fSBlbHNlIGlmICh4aHIuc3RhdHVzIDwgNTAwKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2soeGhyLnN0YXR1cyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc29sZS5lcnJvcignYWpheCBnZXQgZXJyb3InKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0eGhyLm9wZW4oJ0dFVCcsIHVybCk7XG5cdFx0eGhyLnNlbmQoKTtcblx0fSxcblx0cG9zdDogZnVuY3Rpb24gcG9zdCh1cmwsIGRhdGEsIGNhbGxiYWNrKSB7XG5cdFx0dmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuXG5cdFx0eGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gWE1MSHR0cFJlcXVlc3QuRE9ORSkge1xuXHRcdFx0XHRpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG5cdFx0XHRcdFx0dmFyIHJlc3BvbnNlID0geGhyLnJlc3BvbnNlID8gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2UpIDogbnVsbDtcblx0XHRcdFx0XHRjYWxsYmFjayh4aHIuc3RhdHVzLCByZXNwb25zZSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoeGhyLnN0YXR1cyA8IDUwMCkge1xuXHRcdFx0XHRcdGNhbGxiYWNrKHhoci5zdGF0dXMpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnNvbGUuZXJyb3IoJ2FqYXggcG9zdCBlcnJvcicpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblx0XHR4aHIub3BlbignUE9TVCcsIHVybCk7XG5cdFx0eGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtdHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG5cdFx0eGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuXHR9LFxuXHRjb29raWU6IGZ1bmN0aW9uIGNvb2tpZShuYW1lLCBjb29raWVzKSB7XG5cdFx0dmFyIGMgPSB0aGlzLmNvb2tpZXMoY29va2llcyk7XG5cdFx0cmV0dXJuIGNbbmFtZV07XG5cdH0sXG5cdGNvb2tpZXM6IGZ1bmN0aW9uIGNvb2tpZXMoX2Nvb2tpZXMpIHtcblx0XHR2YXIgbmFtZVZhbHVlcyA9IF9jb29raWVzLnNwbGl0KCc7ICcpO1xuXHRcdHZhciByZXN1bHQgPSB7fTtcblx0XHRuYW1lVmFsdWVzLmZvckVhY2goZnVuY3Rpb24gKGl0ZW0pIHtcblx0XHRcdHZhciBpID0gaXRlbS5zcGxpdCgnPScpO1xuXHRcdFx0cmVzdWx0W2lbMF1dID0gaVsxXTtcblx0XHR9KTtcblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9LFxuXHRnZXRRdWVyeVZhbHVlOiBmdW5jdGlvbiBnZXRRdWVyeVZhbHVlKHF1ZXJ5U3RyaW5nLCBuYW1lKSB7XG5cdFx0dmFyIGFyciA9IHF1ZXJ5U3RyaW5nLm1hdGNoKG5ldyBSZWdFeHAobmFtZSArICc9KFteJl0rKScpKTtcblxuXHRcdGlmIChhcnIpIHtcblx0XHRcdHJldHVybiBhcnJbMV07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH1cblx0fVxufTtcblxudmFyIHRlc3RzID0gW3tcblx0aWQ6IDEsXG5cdHRlc3Q6IGZ1bmN0aW9uIHRlc3QoKSB7XG5cdFx0dmFyIGNvb2tpZXMgPSB7XG5cdFx0XHRjc2F0aTogJ21ham9tJyxcblx0XHRcdG9uZTogJ3R3bydcblx0XHR9O1xuXG5cdFx0dmFyIHJlc3VsdCA9IHRydWU7XG5cblx0XHR2YXIgYyA9IGNzLmNvb2tpZXMoJ2NzYXRpPW1ham9tOyBvbmU9dHdvJyk7XG5cblx0XHRpZiAoYy5jc2F0aSAhPT0gY29va2llcy5jc2F0aSkgcmVzdWx0ID0gZmFsc2U7XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9XG59LCB7XG5cdGlkOiAyLFxuXHR0ZXN0OiBmdW5jdGlvbiB0ZXN0KCkge1xuXHRcdHJldHVybiAnYmFyJyA9PT0gY3MuY29va2llKCdmb28nLCAnZm9vPWJhcjsgdGU9bWFqb20nKTtcblx0fVxufSwge1xuXHRpZDogMyxcblx0dGVzdDogZnVuY3Rpb24gdGVzdCgpIHtcblx0XHRyZXR1cm4gJzEyMycgPT09IGNzLmdldFF1ZXJ5VmFsdWUoJz9jc2F0aT1tYWpvbSZ1c2VyX2lkPTEyMyZ2YWxhbWk9c2VtbWknLCAndXNlcl9pZCcpO1xuXHR9XG59XTtcblxuaWYgKGZhbHNlKSB7XG5cdHZhciByZXN1bHQgPSB0cnVlO1xuXHR0ZXN0cy5mb3JFYWNoKGZ1bmN0aW9uICh0ZXN0KSB7XG5cdFx0aWYgKCF0ZXN0LnRlc3QoKSkge1xuXHRcdFx0Y29uc29sZS5lcnJvcih0ZXN0LmlkICsgJy4gdGVzdCBmYWlsZWQnKTtcblx0XHRcdHJlc3VsdCA9IGZhbHNlO1xuXHRcdH1cblx0fSk7XG5cdGlmIChyZXN1bHQpIHtcblx0XHRjb25zb2xlLmxvZygnQWxsIHRlc3RzIHN1Y2NlZWRlZCEnKTtcblx0fVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGNzOyJdfQ==
