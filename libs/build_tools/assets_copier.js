// * ———————————————————————————————————————————————————————— * //
// * 	assets_copier
// *	copies static assets such as images and fonts to the build folder
// * ———————————————————————————————————————————————————————— * //
const assets_copier = function () {}

// * vendor dependencies
const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs-extra'))
const path = require('path')
const watch = require('gulp-watch')
const _ = require('lodash')

// * enduro dependencies
const flat_helpers = require(enduro.enduro_path + '/libs/flat_db/flat_helpers')
const logger = require(enduro.enduro_path + '/libs/logger')

// defines locations that have static files
const static_locations_to_watch = ['assets/img', 'assets/vendor', 'assets/fonts', 'assets/admin_extensions', 'remote', 'assets/root']

// * ———————————————————————————————————————————————————————— * //
// *	todo
// * ———————————————————————————————————————————————————————— * //
assets_copier.prototype.do = function () {
	const self = this

	// check if remote should be watched
	if (enduro.flags.noremotewatch) {
		_.pull(static_locations_to_watch, 'remote')
	}

	// will store promises
	const copy_actions = []

	self.get_copy_from_and_copy_to_pairs()
		.map((pair) => {
			copy_actions.push(copy_if_exist(pair.copy_from, pair.copy_to))
		})

	// also copy /assets/root into the generated root folder
	// this is only useful for static page serving
	copy_actions.push(self.copy_to_root_folder())

	// execute callback when all promises are resolved
	return Promise.all(copy_actions)
}

// * ———————————————————————————————————————————————————————— * //
// * 	watch
// *
// * 	starts to watch for changes in the assets folders
// *	@param {object} gulp - gulp to register the task into
// *	@return {string} - name of the gulp task
// * ———————————————————————————————————————————————————————— * //
assets_copier.prototype.watch = function () {
	const self = this

	self.get_copy_from_and_copy_to_pairs()
		.map((pair) => {
			watch_for_static_change(pair.copy_from, pair.copy_to)
		})
	return Promise.resolve()
}

// * ———————————————————————————————————————————————————————— * //
// * 	get_copy_from_and_copy_to_pairs
// *
// *	will generate absolute paths to both source and destination
// *	static assets folders
// * ———————————————————————————————————————————————————————— * //
assets_copier.prototype.get_copy_from_and_copy_to_pairs = () => {
	return static_locations_to_watch
		.map((static_location) => {
			return {
				copy_from: path.join(enduro.project_path, static_location),
				copy_to: path.join(enduro.project_path, enduro.config.build_folder, static_location)
			}
		})
}

// * ———————————————————————————————————————————————————————— * //
// * 	copy_root_folder
// *
// *	will copy files from `/assets/root` to `/_generated`'s root folder
// *	this is useful for robots.txt or other files that just
// *	have to be served from the root folder
// * ———————————————————————————————————————————————————————— * //
assets_copier.prototype.copy_to_root_folder = () => {
	// stores from and to paths
	const copy_from = path.join(enduro.project_path, 'assets', 'root')
	const copy_to = path.join(enduro.project_path, enduro.config.build_folder)

	return copy_if_exist(copy_from, copy_to)
}

// * ———————————————————————————————————————————————————————— * //
// * 	copy_if_exist
// *
// * 	helper function that copies directory if it exists
// *	@param {string} copy_from - path of the folder to be copied
// *	@param {string} copy_to - destination path for the folder to be copied into
// *	@return {Promise} - resolved if copied successfully
// * ———————————————————————————————————————————————————————— * //
function copy_if_exist (copy_from, copy_to) {
	return flat_helpers.dir_exists(copy_from)
		.then(() => {
			return fs.copyAsync(copy_from, copy_to, { overwrite: true })
		}, () => {})
}

// watches for changes
function watch_for_static_change (copy_from, copy_to) {
	if (!enduro.flags.nowatch) {
		watch([copy_from + '/**/*'], () => {
			if (!enduro.flags.temporary_nostaticwatch) {
				fs.copyAsync(copy_from, copy_to, { overwrite: true })
					.then(() => {}, (err) => {
						console.log('something went wrong with copying files', copy_from, copy_to)
						logger.err(err)
					})
			}
		})
	}
}

module.exports = new assets_copier()
