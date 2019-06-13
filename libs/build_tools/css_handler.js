// * ———————————————————————————————————————————————————————— * //
// * 	CSS Task
// *	use SASS
// * ———————————————————————————————————————————————————————— * //
const css_handler = function () {}

css_handler.prototype.init = function (gulp, browser_sync) {

	// stores task name
	const css_handler_task_name = 'css'
	const sass_handler = require(enduro.enduro_path + '/libs/build_tools/sass_handler').init(gulp, browser_sync)

	gulp.task(css_handler_task_name, function() {
		gulp.start(sass_handler)
	})

	return css_handler_task_name;
}

module.exports = new css_handler()
