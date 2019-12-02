// * ———————————————————————————————————————————————————————— * //
// *	app watcher
// * ———————————————————————————————————————————————————————— * //
const app_watcher = function () {}

// * vendor dependencies
const chokidar = require('chokidar');

// * enduro dependencies
const enduro_server = require(enduro.enduro_path + '/libs/enduro_server/enduro_server')
const logger = require(enduro.enduro_path + '/libs/logger')

app_watcher.prototype.start_watching = function () {
	return chokidar
		.watch([enduro.project_path + '/app/**/*'], { ignoreInitial: true, persistent: true })
		.on('all', (event, path) => {
			enduro.events.this_happened('app_files_changed', {
				event: event,
				path: path,
			})
		})
}

let already_restarting = false
app_watcher.prototype.register_what_to_do_on_change = function () {
	enduro.events.do_on_event('app_files_changed', function () {

		if (already_restarting) {
			logger.timestamp('server already_restarting', 'enduro_events')
			return 1;
		}
		already_restarting = true

		// remove all app files from cache - you know otherwise the change will not be executed
		Object.keys(require.cache).map((path) => {
			if (path.match(enduro.project_path + '/app/')) {
				delete require.cache[path]
			}
		})
		enduro.actions.stop_server()
			.then(() => {
				logger.timestamp('server stopped', 'enduro_events')
				enduro_server.run()
			})
			.then(() => {
				logger.timestamp('server restarted', 'enduro_events')
				already_restarting = false
			})
	})
}

module.exports = new app_watcher()
