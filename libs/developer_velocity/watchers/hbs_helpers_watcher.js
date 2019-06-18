// * ———————————————————————————————————————————————————————— * //
// *	hbs helpers watcher
// * ———————————————————————————————————————————————————————— * //
const js_watcher = function () {}

// * vendor dependencies
const chokidar = require('chokidar');

// * enduro dependencies
const hbs_helpers = require(enduro.enduro_path + '/libs/build_tools/hbs_helpers')

js_watcher.prototype.start_watching = function () {
	return chokidar
		.watch([enduro.project_path + '/assets/hbs_helpers/**/*'], { ignoreInitial: true, persistent: true })
		.on('all', (event, path) => {
			enduro.events.this_happened('hbs_helpers_changed', {
				event: event,
				path: path,
			})
		})
}

js_watcher.prototype.register_what_to_do_on_change = function () {
	enduro.events.do_on_event('hbs_helpers_changed', function () {
		hbs_helpers.do()
	})
}

module.exports = new js_watcher()
