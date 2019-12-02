/** ———————————————————————————————————————————————————————— */
/**    run this by:
/**			mocha --recursive --bail --grep "Development server"
/** ———————————————————————————————————————————————————————— */
const expect = require('chai').expect
const request = require('request')

const local_enduro = require('../index').quick_init()
const test_utilities = require('./libs/test_utilities')

describe('Development server', function () {

	before(function () {
		this.timeout(10000)
		return test_utilities.before(local_enduro, 'devserver', 'minimalistic')
			.then(() => {
				return enduro.actions.developer_start({ norefresh: true, nowatch: true })
			})
			.delay(500)
	})

	it('should serve something on port 5000', function (done) {
		request('http://localhost:5000/', function (error, response, body) {
			if (error) { console.log(error) }
			expect(body).to.contain('body')
			expect(body).to.contain('head')
			expect(body).to.contain('title')
			done()
		})
	})

	after(function () {
		return enduro.actions.stop_server()
			.then(() => {
				return test_utilities.after()
			})
	})

})
