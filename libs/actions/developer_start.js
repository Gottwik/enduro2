// * ———————————————————————————————————————————————————————— * //
// * 	enduro.actions.developer_start
// * ———————————————————————————————————————————————————————— * //

const action = function () {}

// * vendor dependencies
const Promise = require('bluebird')
const extend = require('extend')

// * enduro dependencies
const global_data = require(enduro.enduro_path + '/libs/global_data')
const log_clusters = require(enduro.enduro_path + '/libs/log_clusters/log_clusters')
const enduro_server = require(enduro.enduro_path + '/libs/enduro_server/enduro_server')
const task_runner = require(enduro.enduro_path + '/libs/build_tools/task_runner')
const logger = require(enduro.enduro_path + '/libs/logger')
const website_app = require(enduro.enduro_path + '/libs/website_app')
const change_watcher = require(enduro.enduro_path + '/libs/developer_velocity/change_watcher')

action.prototype.action = function (config) {

	config = config || {}

	extend(true, enduro.flags, config)

	// clears the global data
	global_data.clear()

	log_clusters.log('developer_start')

	logger.timestamp('developer start', 'enduro_events')

	return enduro_server.run()
		.then(() => {
			if (!enduro.flags.nowatch) {
				return change_watcher.start_watching()
			}
		})
}

module.exports = new action()
