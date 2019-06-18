// * ———————————————————————————————————————————————————————— * //
// *	gulp tasks
// *	defines gulp tasks
// * ———————————————————————————————————————————————————————— * //

// * vendor dependencies
const Promise = require('bluebird')

// * enduro dependencies
const logger = require(enduro.enduro_path + '/libs/logger')

// build tools tasks
const pagelist_generator = require(enduro.enduro_path + '/libs/build_tools/pagelist_generator')
const assets_copier = require(enduro.enduro_path + '/libs/build_tools/assets_copier')
const js_handler = require(enduro.enduro_path + '/libs/build_tools/js_handler')
const css_handler = require(enduro.enduro_path + '/libs/build_tools/css_handler')
const hbs_helpers = require(enduro.enduro_path + '/libs/build_tools/hbs_helpers')
const hbs_templates = require(enduro.enduro_path + '/libs/build_tools/hbs_templates')

const task_runner = function () {}

task_runner.prototype.enduro_refresh = function (callback) {
	logger.log('Refresh', true, 'enduro_render_events')
	return enduro.actions.render(true)
}

// * ———————————————————————————————————————————————————————— * //
// * 	JS Handlebars - Not enduro, page-generation related
// * ———————————————————————————————————————————————————————— * //
task_runner.prototype.hbs_templates = function () {
	return hbs_templates.do()
}

// * ———————————————————————————————————————————————————————— * //
// * 	Handlebars helpers
// * ———————————————————————————————————————————————————————— * //
task_runner.prototype.hbs_helpers = function () {
	return hbs_helpers.do()
}

// * ———————————————————————————————————————————————————————— * //
// * 	Preproduction Task
// *	Tasks that need to be done before doing the enduro render
// * ———————————————————————————————————————————————————————— * //
task_runner.prototype.preproduction = function () {
	return pagelist_generator.do()
}

// * ———————————————————————————————————————————————————————— * //
// * 	Production Task
// *	no watching for anything
// * ———————————————————————————————————————————————————————— * //
task_runner.prototype.production = function () {
	const self = this
	return Promise.all([js_handler.do(), css_handler.do(), self.hbs_templates(), assets_copier.do(), self.hbs_helpers()])
}

// * ———————————————————————————————————————————————————————— * //
// * 	Default Task
// * ———————————————————————————————————————————————————————— * //
task_runner.prototype.default = function () {
	const self = this
	return Promise.all([assets_copier.watch()])
}

task_runner.prototype.default_norefresh = function () {
	const self = this
	return Promise.all([assets_copier.watch()])
}

// Export gulp to enable access for enduro
module.exports = new task_runner()
