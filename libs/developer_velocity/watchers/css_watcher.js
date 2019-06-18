// * ———————————————————————————————————————————————————————— * //
// *	css watcher
// * ———————————————————————————————————————————————————————— * //
const css_watcher = function () {}

// * vendor dependencies
const chokidar = require('chokidar');

// * enduro dependencies
const css_handler = require(enduro.enduro_path + '/libs/build_tools/css_handler')

css_watcher.prototype.start_watching = function () {
	return chokidar
		.watch([enduro.project_path + '/assets/css/**/*'], { ignoreInitial: true, persistent: true })
		.on('all', (event, path) => {
			enduro.events.this_happened('css_files_changed', {
				event: event,
				path: path,
			})
		})
}

css_watcher.prototype.register_what_to_do_on_change = function () {
	enduro.events.do_on_event('css_files_changed', function () {
		css_handler.do()
	})
}

module.exports = new css_watcher()
