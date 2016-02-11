var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var reactify = require('reactify');
//var jest = require('gulp-jest');
var uglify = require("gulp-uglify");
var streamify = require("gulp-streamify");
var babelify = require('babelify');

function compileUser() {
	return browserify('./src/scripts/components/user/user.js', { debug: true })
		.transform("babelify", { presets: ["es2015", "react"], sourceMaps: false })
		.bundle()
		.pipe(source('user.js'))
		.pipe(gulp.dest('./public/js/'));
}

function compileHomePage() {
	return browserify('./src/scripts/components/home_page/home_page.js', { debug: true })
		.transform("babelify", { presets: ["es2015", "react"], sourceMaps: false })
		.bundle()
		.pipe(source('home_page.js'))
		.pipe(gulp.dest('./public/js/'));
}

function compileHelpers() {
	return browserify('./src/scripts/helpers/cs.js', { debug: true })
		.transform("babelify", { presets: ["es2015", "react"], sourceMaps: false })
		.bundle()
		.pipe(source('cs.js'))
		.pipe(gulp.dest('./public/js/'));
}

function compileBella() {
	return browserify('./src/scripts/bella/bella.js', { debug: true })
		.transform("babelify", { presets: ["es2015", "react"], sourceMaps: false })
		.bundle()
		.pipe(source('bella.js'))
		.pipe(gulp.dest('./public/js/'));
}

function compileQuestListPage() {
	return browserify('./src/scripts/quest_list_page/quest_list_page.js', { debug: true })
		.transform("babelify", { presets: ["es2015", "react"], sourceMaps: false })
		.bundle()
		.pipe(source('quest_list_page.js'))
		.pipe(gulp.dest('./public/js/'));
}

function compileQuestPage() {
	return browserify('./src/scripts/quest_page/quest_page.js', { debug: true })
		.transform("babelify", { presets: ["es2015", "react"], sourceMaps: false })
		.bundle()
		.pipe(source('quest_page.js'))
		.pipe(gulp.dest('./public/js/'));
}

gulp.task("default", function(){
	compile();
});

gulp.task('compile', function() {
	compile();
});

gulp.task('compileUser', function() {
	compileUser();
});

gulp.task('compileHomePage', function() {
	compileHomePage();
});

gulp.task('compileHelpers', function() {
	compileHelpers();
});

gulp.task('compileBella', function() {
	compileBella();
});

gulp.task('compileQuestListPage', function() {
	compileQuestListPage();
});

gulp.task('compileQuestPage', function() {
	compileQuestPage();
});

gulp.task("watch", function() {
	compileUser();
	compileHomePage();
	compileHelpers();
	compileBella();
	compileQuestListPage();
	compileQuestPage();

	//gulp.watch('./src/**/*.js', ['compile']);
	gulp.watch('./src/scripts/components/user/**/*.js', ['compileUser']);
	//gulp.watch('./src/scripts/components/home_page/**/*.js', ['compileHomePage']);
	gulp.watch('./src/scripts/**/*.js', ['compileHomePage']);
	gulp.watch('./src/scripts/bella/**/*.js', ['compileBella']);
	gulp.watch('./src/scripts/quest_list_page/**/*.js', ['compileQuestListPage']);
	gulp.watch('./src/scripts/quest_page/**/*.js', ['compileQuestPage']);
	/*gulp.watch('./src/scripts/!**!/!*.js', [
		'compileHomePage',
		'compileHelpers',
		'compileBella',
		'compileUser',
		'compileQuestPage',
		'compileQuestListPage'
	]);*/
});

/*
Not working yet, use command: 'npm test' instead
gulp.task('jest', function () {
	return gulp.src('__tests__').pipe(jest({
		scriptPreprocessor: "./spec/support/preprocessor.js",
		unmockedModulePathPatterns: [
			"node_modules/react"
		],
		testDirectoryName: "spec",
		testPathIgnorePatterns: [
			"node_modules",
			"spec/support"
		],
		moduleFileExtensions: [
			"js",
			"json",
			"react"
		]
	}));
});*/
