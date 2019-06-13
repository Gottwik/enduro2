// * ———————————————————————————————————————————————————————— * //
// *	gulp tasks
// *	defines gulp tasks
// * ———————————————————————————————————————————————————————— * //

// * vendor dependencies
const Promise = require('bluebird')
const gulp = require('gulp')
const watch = require('gulp-watch')
const browser_sync = require('browser-sync').create()
const fs = require('fs')
const handlebars = require('gulp-handlebars')
const defineModule = require('gulp-define-module')
const flatten = require('gulp-flatten')
const concat = require('gulp-concat')
const filterBy = require('gulp-filter-by')
const wrap = require('gulp-wrap')

// * enduro dependencies
const flat_helpers = require(enduro.enduro_path + '/libs/flat_db/flat_helpers')
const logger = require(enduro.enduro_path + '/libs/logger')
const event_hooks = require(enduro.enduro_path + '/libs/external_links/event_hooks')

// Gulp tasks
const pagelist_generator = require(enduro.enduro_path + '/libs/build_tools/pagelist_generator')
const assets_copier = require(enduro.enduro_path + '/libs/build_tools/assets_copier')
const js_handler = require(enduro.enduro_path + '/libs/build_tools/js_handler')
const css_handler = require(enduro.enduro_path + '/libs/build_tools/css_handler')

const gulp_tasks = function () {}

gulp_tasks.prototype.enduro_refresh = function (callback) {
	logger.log('Refresh', true, 'enduro_render_events')
	return enduro.actions.render(true)
}

// * ———————————————————————————————————————————————————————— * //
// * 	browser sync task
// * ———————————————————————————————————————————————————————— * //
gulp_tasks.prototype.browser_sync = function () {
	const self = this
	return self.browsersync_start(false)
}

gulp_tasks.prototype.browser_sync_norefresh = function () {
	const self = this
	return self.browsersync_start(true)
}

gulp_tasks.prototype.browser_sync_stop = function () {
	browser_sync.exit()
	return new Promise.resolve()
}

gulp_tasks.prototype.browsersync_start  = function (norefresh) {
	const self = this
	logger.timestamp('browsersync started', 'enduro_events')
	browser_sync.init({
		server: {
			baseDir: enduro.project_path + '/' + enduro.config.build_folder,
			middleware: function (req, res, next) {

				if (req.url.slice(-1) == '/') {
					req.url += 'index.html'
					return next()
				}

				const splitted_url = req.url.split('/')

				if (splitted_url.length == 2 && enduro.config.cultures.indexOf(splitted_url[1]) + 1) {
					req.url += '/index.html'
					return next()
				}

				// serve files without html
				if (!(req.url.indexOf('.') + 1) && req.url.length > 3) {
					req.url += '/index.html'
				}

				// patch to enable development of admin ui in enduro
				static_path_pattern = new RegExp(enduro.config.static_path_prefix + '/(.*)')
				if (static_path_pattern.test(req.url)) {
					req.url = '/' + req.url.match(static_path_pattern)[1]
				}

				// serve admin/index file on /admin url
				if (req.url == '/admin/') { req.url = '/admin/index.html' }

				return next()
			},
		},
		ui: false,
		logLevel: 'silent',
		notify: false,
		logPrefix: 'Enduro',
		open: !norefresh,
		snippetOptions: {
			rule: {
				match: /<\/body>/i,
				fn: function (snippet, match) {
					return match + snippet
				}
			}
		}
	})

	// nowatch flag is used when testing development server
	// the watch kindof stayed in memory and screwed up all other tests
	if (!enduro.flags.nowatch) {

		// Watch for any js changes
		watch([enduro.project_path + '/assets/js/**/*.js'], () => { 
			js_handler.do()
		})

		// Watch for sass changes
		watch(
			[
				enduro.project_path + '/assets/css/**/*',
			],
			() => {
				return css_handler.do(css_handler)
					.then(() => {
						event_hooks.execute_hook('post_update')
					})
			})

		// Watch for local handlebars helpers
		watch([enduro.project_path + '/assets/hbs_helpers/**/*'], () => {
			self.hbs_helpers()
		})

		// Watch for hbs templates
		watch([enduro.project_path + '/components/**/*.hbs'], () => {
			self.hbs_templates()
		})

		// Watch for enduro changes
		if (!enduro.flags.nocontentwatch) {

			watch([enduro.project_path + '/pages/**/*.hbs', enduro.project_path + '/components/**/*.hbs', enduro.project_path + '/cms/**/*.js'], function () {

				// don't do anything if nocmswatch flag is set
				if (!enduro.flags.nocmswatch && !enduro.flags.temporary_nocmswatch) {
					gulp.enduro_refresh()
						.then(() => {
							browser_sync.reload()
						})
				} else {
					setTimeout(() => {
						browser_sync.reload()
					}, 500)
				}
				enduro.flags.temporary_nocmswatch = false
			})
		}
	}
}

// * ———————————————————————————————————————————————————————— * //
// * 	JS Handlebars - Not enduro, page-generation related
// * ———————————————————————————————————————————————————————— * //
gulp_tasks.prototype.hbs_templates = function () {
	return gulp.src(enduro.project_path + '/components/**/*.hbs')
		.pipe(handlebars({
			// Pass local handlebars
			handlebars: enduro.templating_engine,
		}))
		.pipe(defineModule('amd'))
		.pipe(flatten())
		.pipe(gulp.dest(enduro.project_path + '/' + enduro.config.build_folder + '/assets/hbs_templates'))
}

// * ———————————————————————————————————————————————————————— * //
// * 	Handlebars helpers
// * ———————————————————————————————————————————————————————— * //
gulp_tasks.prototype.hbs_helpers = function () {
	return gulp.src([enduro.project_path + '/assets/hbs_helpers/**/*.js', enduro.enduro_path + '/hbs_helpers/**/*.js'])
		.pipe(filterBy(function (file) {
			return file.contents.toString().indexOf('enduro_nojs') == -1
		}))
		.pipe(concat('hbs_helpers.js'))
		.pipe(wrap('define([],function() { return function(enduro.templating_engine) { \n\n<%= contents %>\n\n }})'))
		.pipe(gulp.dest(enduro.project_path + '/' + enduro.config.build_folder + '/assets/hbs_helpers/'))
}

// * ———————————————————————————————————————————————————————— * //
// * 	Preproduction Task
// *	Tasks that need to be done before doing the enduro render
// * ———————————————————————————————————————————————————————— * //
gulp_tasks.prototype.preproduction = function () {
	return pagelist_generator.do()
}

// * ———————————————————————————————————————————————————————— * //
// * 	Production Task
// *	No browser_sync, no watching for anything
// * ———————————————————————————————————————————————————————— * //
gulp_tasks.prototype.production = function () {
	const self = this
	return Promise.all([js_handler.do(), css_handler.do(browser_sync), self.hbs_templates(), assets_copier.do(), self.hbs_helpers()])
}

// * ———————————————————————————————————————————————————————— * //
// * 	Default Task
// * ———————————————————————————————————————————————————————— * //
gulp_tasks.prototype.default = function () {
	const self = this
	return Promise.all([assets_copier.watch(browser_sync), self.browser_sync()])
}

gulp_tasks.prototype.default_norefresh = function () {
	const self = this
	return Promise.all([assets_copier.watch(browser_sync), self.browser_sync_norefresh()])
}

// Export gulp to enable access for enduro
module.exports = new gulp_tasks()
