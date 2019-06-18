// * ———————————————————————————————————————————————————————— * //
// * 	enduro.actions.stop_server
// * ———————————————————————————————————————————————————————— * //

const action = function () {}

const enduro_server = require(enduro.enduro_path + '/libs/enduro_server/enduro_server')
const task_runner = require(enduro.enduro_path + '/libs/build_tools/task_runner')

action.prototype.action = function () {
	return enduro_server.stop()
		.then(() => {
			enduro.events.this_happened('server_shutdown')
		})
}

module.exports = new action()
