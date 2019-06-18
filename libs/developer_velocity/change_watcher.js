// * ———————————————————————————————————————————————————————— * //
// * 	website api forwarder
// * ———————————————————————————————————————————————————————— * //
const change_watcher = function () {}

// * vendor dependencies
const glob = require('glob')
const path = require('path')

change_watcher.prototype.all_watchers = []

// * ———————————————————————————————————————————————————————— * //
// * 	watch_for
// * ———————————————————————————————————————————————————————— * //
change_watcher.prototype.start_watching = function () {
	var self = this

	// hook up all watchers
    glob.sync(path.join(enduro.enduro_path, 'libs', 'developer_velocity', 'watchers', '**', '*.js')).forEach(function (file) {
    	const watcher = require(path.resolve(file))
    	watcher.register_what_to_do_on_change()
        self.all_watchers.push(watcher.start_watching())
    })

    // stop watching when server gets shut down
	enduro.events.do_on_event('server_shutdown', () => {
		self.all_watchers.map((watcher) => {
			watcher.close()
		})
	})
}


module.exports = new change_watcher()
