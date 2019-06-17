/** ———————————————————————————————————————————————————————— */
/**    run this by:
/**			mocha --recursive --bail --grep "events system"
/** ———————————————————————————————————————————————————————— */

// * vendor dependencies
const expect = require('chai').expect
const Promise = require('bluebird')

// * enduro dependencies
const events = require(enduro.enduro_path + '/libs/events/events')

let test_value = 0

describe('events system', function () {

	// register an event
	before(function () {
		events.do_on_event('test_event', (args) => {
			test_value = args.set_to_value
		})
	})


	it('trigger_event', function () {
		expect(test_value).to.equal(0)
		return events.this_happened('test_event', {
			set_to_value: 1,
		})
			.then(() => {
				expect(test_value).to.equal(1)
			})
	})

})
