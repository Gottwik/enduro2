// * ———————————————————————————————————————————————————————— * //
// * 	CSS Task
// *	use SASS
// * ———————————————————————————————————————————————————————— * //
const css_handler = function () {}

const sass_handler = require(enduro.enduro_path + '/libs/build_tools/sass_handler')

css_handler.prototype.do = function (browser_sync) {
	return sass_handler.do(browser_sync)
}

module.exports = new css_handler()
