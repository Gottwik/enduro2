// * ———————————————————————————————————————————————————————— * //
// * 	website api forwarder
// *	this module forwards the express application to enduro application
// *	to enable building of custom api and functionality
// * ———————————————————————————————————————————————————————— * //
const website_app = function () {}

// * enduro dependencies
const flat_helpers = require(enduro.enduro_path + '/libs/flat_db/flat_helpers')
const watch = require('gulp-watch')

// constants
const LOCAL_APP_FILE = enduro.project_path + '/app/app.js'

// * ———————————————————————————————————————————————————————— * //
// * 	forward app
// *
// *	@param {express application} app - root express app
// *	@return {null}
// * ———————————————————————————————————————————————————————— * //
website_app.prototype.forward = function (app, server) {

	// checks if app.js is present in local enduro app
	if (flat_helpers.file_exists_sync(LOCAL_APP_FILE)) {

		// forward the app to local enduro app
		try {
			require(LOCAL_APP_FILE).init(app, server)
		} catch (e) {
			console.log(e)
		}
	}
}

module.exports = new website_app()
