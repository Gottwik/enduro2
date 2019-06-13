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
const iconfont = require('gulp-iconfont')
const iconfontCss = require('gulp-iconfont-css')
const handlebars = require('gulp-handlebars')
const defineModule = require('gulp-define-module')
const flatten = require('gulp-flatten')
const concat = require('gulp-concat')
const filterBy = require('gulp-filter-by')
const wrap = require('gulp-wrap')
const path = require('path')

// * enduro dependencies
const flat_helpers = require(enduro.enduro_path + '/libs/flat_db/flat_helpers')
const logger = require(enduro.enduro_path + '/libs/logger')
const event_hooks = require(enduro.enduro_path + '/libs/external_links/event_hooks')

// Gulp tasks
const pagelist_generator = require(enduro.enduro_path + '/libs/build_tools/pagelist_generator').init(gulp)
const assets_copier = require(enduro.enduro_path + '/libs/build_tools/assets_copier').init(gulp, browser_sync)
const assets_copier_watch = require(enduro.enduro_path + '/libs/build_tools/assets_copier').watch(gulp, browser_sync)
const js_handler = require(enduro.enduro_path + '/libs/build_tools/js_handler').init(gulp, browser_sync)
const css_handler = require(enduro.enduro_path + '/libs/build_tools/css_handler').init(gulp, browser_sync)

gulp.enduro_refresh = function (callback) {
	logger.log('Refresh', true, 'enduro_render_events')
	return enduro.actions.render(true)
}

// * ———————————————————————————————————————————————————————— * //
// * 	browser sync task
// * ———————————————————————————————————————————————————————— * //
gulp.task('browser_sync', function () {
	browsersync_start(false)
})

gulp.task('browser_sync_norefresh', function () {
	browsersync_start(true)
})

gulp.task('browser_sync_stop', [], function () {
	return browser_sync.exit()
})

function browsersync_start (norefresh) {
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
		watch([enduro.project_path + '/assets/js/**/*.js'], () => { gulp.start(js_handler) })

		// Watch for sass changes
		watch(
			[
				enduro.project_path + '/assets/css/**/*',
				enduro.project_path + '/assets/fonticons/*',
			],
			() => {
				gulp.start(css_handler, () => {
					event_hooks.execute_hook('post_update')
				})
			})

		// Watch for local handlebars helpers
		watch([enduro.project_path + '/assets/hbs_helpers/**/*'], () => { gulp.start('hbs_helpers') })

		// Watch for font icon
		watch([enduro.project_path + '/assets/fonticons/*.svg'], () => {
			gulp.start('iconfont')
			gulp.enduro_refresh()
		})

		// Watch for hbs templates
		watch([enduro.project_path + '/components/**/*.hbs'], () => { gulp.start('hbs_templates') })

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
// * 	iconfont
// * ———————————————————————————————————————————————————————— * //
gulp.task('iconfont', function (cb) {
	return gulp.src([enduro.project_path + '/assets/fonticons/*.svg'])
		.pipe(iconfontCss({
			fontName: enduro.config.project_slug + '_icons',
			path: path.join(enduro.project_path, '/assets/fonticons/icons_template.scss'),
			targetPath: path.join(enduro.project_path, enduro.config.build_folder, '/_prebuilt/icons.scss'),
			fontPath: '/assets/iconfont/',
		}))
		.pipe(iconfont({
			fontName: enduro.config.project_slug + '_icons',
			prependUnicode: true,
			fontHeight: 1024,
			normalize: true,
			formats: ['ttf', 'eot', 'woff'],
			log: () => {},
		}))
		.on('glyphs', function (glyphs, options) {
			glyphs = glyphs.map(function (glyph) {
				glyph.unicode = glyph.unicode[0].charCodeAt(0).toString(16)
				return glyph
			})
			const icon_json_file_path = path.join(enduro.project_path, enduro.config.build_folder, '/_prebuilt/icons.json')
			flat_helpers.ensure_directory_existence(icon_json_file_path)
				.then(() => {
					fs.writeFileSync(icon_json_file_path, JSON.stringify(glyphs))
					cb()
				})
		})
		.pipe(gulp.dest(path.join(enduro.project_path, enduro.config.build_folder, '/assets/iconfont/')))
})

// * ———————————————————————————————————————————————————————— * //
// * 	JS Handlebars - Not enduro, page-generation related
// * ———————————————————————————————————————————————————————— * //
gulp.task('hbs_templates', function () {
	gulp.src(enduro.project_path + '/components/**/*.hbs')
		.pipe(handlebars({
			// Pass local handlebars
			handlebars: enduro.templating_engine,
		}))
		.pipe(defineModule('amd'))
		.pipe(flatten())
		.pipe(gulp.dest(enduro.project_path + '/' + enduro.config.build_folder + '/assets/hbs_templates'))
})

// * ———————————————————————————————————————————————————————— * //
// * 	Handlebars helpers
// * ———————————————————————————————————————————————————————— * //
gulp.task('hbs_helpers', function () {
	return gulp.src([enduro.project_path + '/assets/hbs_helpers/**/*.js', enduro.enduro_path + '/hbs_helpers/**/*.js'])
		.pipe(filterBy(function (file) {
			return file.contents.toString().indexOf('enduro_nojs') == -1
		}))
		.pipe(concat('hbs_helpers.js'))
		.pipe(wrap('define([],function() { return function(enduro.templating_engine) { \n\n<%= contents %>\n\n }})'))
		.pipe(gulp.dest(enduro.project_path + '/' + enduro.config.build_folder + '/assets/hbs_helpers/'))
})

// * ———————————————————————————————————————————————————————— * //
// * 	Preproduction Task
// *	Tasks that need to be done before doing the enduro render
// * ———————————————————————————————————————————————————————— * //
gulp.task('preproduction', ['iconfont', pagelist_generator])

// * ———————————————————————————————————————————————————————— * //
// * 	Production Task
// *	No browser_sync, no watching for anything
// * ———————————————————————————————————————————————————————— * //
gulp.task('production', [js_handler, css_handler, 'hbs_templates', assets_copier, 'hbs_helpers'])

// * ———————————————————————————————————————————————————————— * //
// * 	Default Task
// * ———————————————————————————————————————————————————————— * //
// gulp.task('default', ['hbs_templates', 'sass', 'js', 'img', 'vendor', 'fonts', 'hbs_helpers', 'browser_sync'])
gulp.task('default', [assets_copier_watch, 'browser_sync'])
gulp.task('default_norefresh', [assets_copier_watch, 'browser_sync_norefresh'])

gulp.start_promised = function (task_name) {
	return new Promise(function (resolve, reject) {
		gulp.start(task_name, () => {
			resolve()
		})
	})
}

// Export gulp to enable access for enduro
module.exports = gulp
