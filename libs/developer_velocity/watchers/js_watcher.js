// * ———————————————————————————————————————————————————————— * //
// *	js watcher
// * ———————————————————————————————————————————————————————— * //
const js_watcher = function () {}

// * vendor dependencies
const chokidar = require('chokidar');

// * enduro dependencies
const js_handler = require(enduro.enduro_path + '/libs/build_tools/js_handler')

js_watcher.prototype.start_watching = function () {
	return chokidar
		.watch([enduro.project_path + '/assets/js/**/*'], { ignoreInitial: true, persistent: true })
		.on('all', (event, path) => {
			enduro.events.this_happened('js_files_changed', {
				event: event,
				path: path,
			})
		})
}

js_watcher.prototype.register_what_to_do_on_change = function () {
	enduro.events.do_on_event('js_files_changed', function () {
		js_handler.do()
	})
}

module.exports = new js_watcher()