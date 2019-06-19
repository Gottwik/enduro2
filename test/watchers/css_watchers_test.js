/** ———————————————————————————————————————————————————————— */
/**    run this by:
/**			mocha --recursive --bail --grep "Css watcher test"
/** ———————————————————————————————————————————————————————— */

// * vendor dependencies
const expect = require('chai').expect
const path = require('path')
var fs = require('fs-extra');

// * enduro dependencies
const local_enduro = require('../../index').quick_init()
const flat_helpers = require(enduro.enduro_path + '/libs/flat_db/flat_helpers')
const test_utilities = require(enduro.enduro_path + '/test/libs/test_utilities')

const change_watcher = require(enduro.enduro_path + '/libs/developer_velocity/change_watcher')

describe('Css watcher test', function () {
	this.timeout(17000)

	before(function () {
		return test_utilities.before(local_enduro, 'css_watchers_testfolder')
			.then(() => {
				return enduro.actions.render()
			})
			.then(() => {
				return change_watcher.start_watching()
			})
	})

	it('should fire event in case css file is changed', function (done) {

		// // we start listeing for css change, then we change the file
		// enduro.events.do_on_event('css_files_changed', function (args) {
		// 	expect(args.path).to.include('test_file.css')
		// 	expect(args.event).to.equal('add')
		// 	done()
		// })

		setTimeout(() => {
			fs.writeFile(enduro.project_path + '/assets/css/test_file.css', 'color: #f0f;')
			done()
		}, 500)
	})

	after(function () {
		return enduro.actions.stop_server()
			.then(() => {
				return test_utilities.after()
			})
	})
})
