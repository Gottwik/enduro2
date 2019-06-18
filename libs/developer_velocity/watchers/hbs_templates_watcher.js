// * ———————————————————————————————————————————————————————— * //
// *	hbs templates watcher
// * ———————————————————————————————————————————————————————— * //
const hbs_templates_watcher = function () {}

// * vendor dependencies
const chokidar = require('chokidar');

// * enduro dependencies
const hbs_helpers = require(enduro.enduro_path + '/libs/build_tools/hbs_helpers')

hbs_templates_watcher.prototype.start_watching = function () {
	return chokidar
		.watch([
			enduro.project_path + '/components/**/*',
			enduro.project_path + '/pages/**/*',
			enduro.project_path + '/cms/**/*.js',
			], {
				ignoreInitial: true,
				persistent: true
		})
		.on('all', (event, path) => {
			enduro.events.this_happened('templates_changed', {
				event: event,
				path: path,
			})
		})
}

hbs_templates_watcher.prototype.register_what_to_do_on_change = function () {
	enduro.events.do_on_event('templates_changed', function () {
		return enduro.actions.render(true)
	})
}

module.exports = new hbs_templates_watcher()
