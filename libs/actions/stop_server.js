// * ———————————————————————————————————————————————————————— * //
// * 	enduro.actions.stop_server
// * ———————————————————————————————————————————————————————— * //

const action = function () {}

const enduro_server = require(enduro.enduro_path + '/libs/enduro_server/enduro_server')

action.prototype.action = function () {
	return enduro_server.stop()
		.then(() => {
			enduro.events.this_happened('server_shut_down')
		})
}

module.exports = new action()
