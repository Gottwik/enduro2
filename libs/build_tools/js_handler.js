// * ———————————————————————————————————————————————————————— * //
// * 	JS Task
// *	Transpile ES6 to JS
// * ———————————————————————————————————————————————————————— * //
const js_handler = function () {}

// * vendor dependencies
const sourcemaps = require('gulp-sourcemaps')
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))

// * enduro dependencies
const flat_helpers = require(enduro.enduro_path + '/libs/flat_db/flat_helpers')
const logger = require(enduro.enduro_path + '/libs/logger')

js_handler.prototype.do = function () {

	const copy_from = enduro.project_path + '/assets/js'
	const copy_to = enduro.project_path + '/' + enduro.config.build_folder + '/assets/js'
	return flat_helpers.dir_exists(copy_from)
		.then(() => {
			return fs.copyAsync(copy_from, copy_to, { overwrite: true })
		}, () => {})
}

module.exports = new js_handler()
