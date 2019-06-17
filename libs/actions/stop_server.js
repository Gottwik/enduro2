// * ———————————————————————————————————————————————————————— * //
// * 	enduro.actions.stop_server
// * ———————————————————————————————————————————————————————— * //

const action = function () {}

const enduro_server = require(enduro.enduro_path + '/libs/enduro_server/enduro_server')
const gulp_tasks = require(enduro.enduro_path + '/libs/build_tools/gulp_tasks')

action.prototype.action = function () {
	return gulp_tasks.browser_sync_stop()
		.then(() => {
			return enduro_server.stop()
		})
		.then(() => {
			enduro.events.this_happened('server_shutdown')
		})
}

module.exports = new action()
