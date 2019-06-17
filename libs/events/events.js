// * ———————————————————————————————————————————————————————— * //
// * 	events
// *	execute commandline commands after certain events
// * —————————————————————————————————————————s——————————————— * //
const events = function () {}

// * vendor dependencies
const Promise = require('bluebird')

events.prototype.events = {}

events.prototype.this_happened = function (event_name, args) {
	const self = this

	if (!(event_name in self.events)) {
		return new Promise.resolve()
	}

	return Promise.all(self.events[event_name].map((f) => { f(args) }))
}

events.prototype.do_on_event = function (event_name, do_promise) {
	const self = this

	if (!(event_name in self.events)) {
		self.events[event_name] = []
	}

	self.events[event_name].push(do_promise)
}

module.exports = new events()
