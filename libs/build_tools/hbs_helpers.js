// * ———————————————————————————————————————————————————————— * //
// * 	hbs helpers task
// * ———————————————————————————————————————————————————————— * //
const hbs_helpers_task = function () {}

// * vendor dependencies
const Promise = require('bluebird')
const gulp = require('gulp')
const concat = require('gulp-concat')
const filterBy = require('gulp-filter-by')
const wrap = require('gulp-wrap')

// * enduro dependencies
const flat_helpers = require(enduro.enduro_path + '/libs/flat_db/flat_helpers')
const logger = require(enduro.enduro_path + '/libs/logger')

hbs_helpers_task.prototype.do = function () {

	return gulp.src([enduro.project_path + '/assets/hbs_helpers/**/*.js', enduro.enduro_path + '/hbs_helpers/**/*.js'])
		.pipe(filterBy(function (file) {
			return file.contents.toString().indexOf('enduro_nojs') == -1
		}))
		.pipe(concat('hbs_helpers.js'))
		.pipe(wrap('define([],function() { return function(enduro.templating_engine) { \n\n<%= contents %>\n\n }})'))
		.pipe(gulp.dest(enduro.project_path + '/' + enduro.config.build_folder + '/assets/hbs_helpers/'))
}

module.exports = new hbs_helpers_task()
