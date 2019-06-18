// * ———————————————————————————————————————————————————————— * //
// * 	hbs templates task
// * ———————————————————————————————————————————————————————— * //
const hbs_templates_task = function () {}

// * vendor dependencies
const Promise = require('bluebird')
const gulp = require('gulp')
const gulp_handlebars = require('gulp-handlebars')
const defineModule = require('gulp-define-module')
const flatten = require('gulp-flatten')

// * enduro dependencies
const flat_helpers = require(enduro.enduro_path + '/libs/flat_db/flat_helpers')
const logger = require(enduro.enduro_path + '/libs/logger')

hbs_templates_task.prototype.do = function () {

	return gulp.src(enduro.project_path + '/components/**/*.hbs')
		.pipe(gulp_handlebars({
			// Pass local handlebars
			handlebars: enduro.templating_engine,
		}))
		.pipe(defineModule('amd'))
		.pipe(flatten())
		.pipe(gulp.dest(enduro.project_path + '/' + enduro.config.build_folder + '/assets/hbs_templates'))
}

module.exports = new hbs_templates_task()
