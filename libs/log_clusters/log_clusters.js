// * ———————————————————————————————————————————————————————— * //
// * 	log clusters
// *
// *	defines logging clusters
// * ———————————————————————————————————————————————————————— * //
const log_clusters = function () {}

// * enduro dependencies
const logger = require(enduro.enduro_path + '/libs/logger')

let clusters = []

log_clusters.prototype.log = function (cluster, context) {
	clusters[cluster](context)
}

clusters['developer_start'] = (context) => {
	const version = require(enduro.enduro_path + '/package.json').version

	logger.init('Enduro[' + version + '] started', 'nice_dev_init')
	logger.log('Server started at:', 'nice_dev_init')
	logger.tablog('localhost:5000', 'nice_dev_init')

	if (!enduro.flags.noadmin) {
		logger.log('Admin ui available at:', 'nice_dev_init')
		logger.tablog('localhost:5000/admin', false, 'nice_dev_init')
	}

	logger.end('nice_dev_init')
}

clusters['creating_project'] = (context) => {
	logger.init('ENDURO - CREATING PROJECT')
	logger.log('Creating new project ' + context.project_name)
	logger.line()
}

clusters['project_created'] = (context) => {
	logger.log('Project created successfully.')
	logger.line()
	logger.log('Dont forget to cd into project with', true)
	logger.tablog('$ cd ' + context.project_name, true)
	logger.log('Then run', true)
	logger.tablog('$ enduro dev', true)
	logger.end()
}

clusters['extraction_failed'] = (context) => {
	logger.err_blockStart('juice extraction failed')
	logger.err('There is something wrong with the last juice archive')
	logger.err(' ')
	logger.err('Run:')
	logger.err('\t$ enduro juice pack -f')
	logger.err(' ')
	logger.err('To repair the issue')
	logger.err_blockEnd()
}

clusters['malformed_context_file'] = (context) => {
	logger.err('malformed_context_file: ' + context)
}

module.exports = new log_clusters()
