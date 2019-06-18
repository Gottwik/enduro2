// * ———————————————————————————————————————————————————————— * //
// * 	CSS Task
// *	use SASS
// * ———————————————————————————————————————————————————————— * //
const css_handler = function () {}

const sass_handler = require(enduro.enduro_path + '/libs/build_tools/sass_handler')

css_handler.prototype.do = function () {
	return sass_handler.do()
}

module.exports = new css_handler()
