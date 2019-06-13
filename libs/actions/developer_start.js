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
const gulp_tasks = require(enduro.enduro_path + '/libs/build_tools/gulp_tasks')
const logger = require(enduro.enduro_path + '/libs/logger')

action.prototype.action = function (config) {

	config = config || {}

	extend(true, enduro.flags, config)

	// clears the global data
	global_data.clear()

	log_clusters.log('developer_start')

	logger.timestamp('developer start', 'enduro_events')

	let prevent_double_callback = false

	return enduro.actions.render()
		.then(() => {
			logger.timestamp('Render finished', 'enduro_events')

			const task_to_run = enduro.flags.norefresh ? 'default_norefresh' : 'default'
			return gulp_tasks[task_to_run]()
				.then(() => {
					if (!enduro.flags.noadmin && !prevent_double_callback) {
						prevent_double_callback = true
						logger.timestamp('production server starting', 'enduro_events')

						if (!enduro.flags.noproduction) {
							// start production server in development mode
							enduro_server.run({ development_mode: true })
						}

					}
				})
		})
}

module.exports = new action()
