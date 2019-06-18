// * ———————————————————————————————————————————————————————— * //
// * 	Sass Task
// *	Processes assets/css/main.scss file
// *	All other scss files need to be imported in main.scss to get compiled
// *	Uses bulkSass for @import subfolder/* funcionality
// * ———————————————————————————————————————————————————————— * //
const sass_handler = function () {}

// * vendor dependencies
const bulkSass = require('gulp-sass-bulk-import-gottwik')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const autoprefixer = require('gulp-autoprefixer')
const gulp = require('gulp')

// * enduro dependencies
const logger = require(enduro.enduro_path + '/libs/logger')

sass_handler.prototype.do = function () {

	logger.timestamp('Sass compiling started', 'enduro_events')

	return gulp.src(enduro.project_path + '/assets/css/*.scss')
		.pipe(bulkSass())
		.pipe(sourcemaps.init())
		.pipe(sass())
		.on('error', function (err) {
			logger.err_blockStart('Sass error')
			logger.err(err.message)
			logger.err_blockEnd()
			this.emit('end')
		})
		.pipe(autoprefixer({
			browsers: ['last 2 versions'],
			cascade: false,
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest(enduro.project_path + '/' + enduro.config.build_folder + '/assets/css'))
		.on('end', () => {
			logger.timestamp('Sass compiling finished', 'enduro_events')
		})
}

module.exports = new sass_handler()
