// * ———————————————————————————————————————————————————————— * //
// * 	pagelist generator
// *	goes through all the pages and generates a json from them
// *
// *	pagelist json is saved and get_cms_list() will quickly retrieve it without
// *	generation it again
// *
// *	pagelist generator will generate two lists - a structured and flat list
// * ———————————————————————————————————————————————————————— * //
const pagelist_generator = function () {}

// * vendor dependencies
const Promise = require('bluebird')
const fs = require('fs-extra')
const glob = require('glob')
const extend = require('extend')
const path = require('path')

// * enduro dependencies
const flat_helpers = require(enduro.enduro_path + '/libs/flat_db/flat_helpers')
const format_service = require(enduro.enduro_path + '/libs/services/format_service')

// * ———————————————————————————————————————————————————————— * //
// * 	todo
// * ———————————————————————————————————————————————————————— * //
pagelist_generator.prototype.do = function (gulp) {
	const self = this

	return self.generate_cms_list()
		.then((cmslist) => {

			// Extends global data with currently loaded data
			extend(true, enduro.cms_data.global, {cmslist: cmslist})

			return self.save_cms_list(cmslist)
		})
}

// * ———————————————————————————————————————————————————————— * //
// * 	generate cms list
// *
// * 	generates list of pages with global datasets and generators
// *	@return {promise} - promise with cmslist
// * ———————————————————————————————————————————————————————— * //
pagelist_generator.prototype.generate_cms_list = function () {
	return new Promise(function (resolve, reject) {
		glob(enduro.project_path + '/cms/**/*.js', function (err, files) {
			if (err) { console.log('failed to generate cms list', err) }

			let pagelist = {}
			let flat_pagelist = []

			// helper function to build the pagelist
			function build (pagepath, partial_pages, fullpath) {

				// decides if pagepath is folder or file
				if (pagepath.length == 1) {

					let page = {}
					page.page = true
					page.fullpath = '/' + fullpath.join('/')
					page.name = format_service.prettify_string(pagepath[0])
					page.page_slug = pagepath[0].toString()


					// mark generator template as hidden
					if (fullpath[0] == 'generators' && fullpath.length >= 2 && fullpath[fullpath.length - 2] == fullpath[fullpath.length - 1]) {
						page.hidden = true
					}

					partial_pages[pagepath[0]] = page
					flat_pagelist.push(page)
				} else {

					// remove templates from pagelist
					if (pagepath[0] == 'templates') {
						return
					}

					let folder = {}
					folder.folder = true
					folder.fullpath = '/' + fullpath.join('/')
					folder.name = format_service.prettify_string(pagepath[0])
					folder.folder_slug = pagepath[0].toString()

					if (fullpath[0] == 'generators' && pagepath.length != fullpath.length) {
						folder.generator = true
					}

					// global and generators receive special treatment and the subfolders are not created
					if (folder.name.toLowerCase() == 'global' || folder.name.toLowerCase() == 'generators') {
						build(pagepath.slice(1), partial_pages, fullpath)
					} else {

						// adds the folder to the tree if it's not there yet
						if (!(pagepath[0] in partial_pages)) {
							partial_pages[pagepath[0]] = folder
						}

						build(pagepath.slice(1), partial_pages[pagepath[0]], fullpath)
					}

				}
			}

			// goes throught the glob, crops the filename and builds a pagelist
			files.map((file) => {
				return file.match('/cms/(.*).js')[1].split('/')
			}).forEach((pagepath) => {
				build(pagepath, pagelist, pagepath)
			})

			composed_pagelist = {
				structured: pagelist,
				flat: flat_pagelist
			}

			resolve(composed_pagelist)
		})
	})
}

// * ———————————————————————————————————————————————————————— * //
// * 	save cms list
// *
// * 	saves the cmslist to predefined path
// *	@return {promise} - promise with cmslist
// * ———————————————————————————————————————————————————————— * //
pagelist_generator.prototype.save_cms_list = function (cmslist) {
	const self = this

	return new Promise(function (resolve, reject) {

		// regenerates pagelist_desination in case cmd_folder has changed
		pagelist_destination = self.get_pregenerated_pagelist_path()

		// Saves the cmslist into a specified file
		flat_helpers.ensure_directory_existence(pagelist_destination)
			.then(() => {
				fs.writeFile(pagelist_destination, JSON.stringify(cmslist), function (err) {
					if (err) { console.log(err) }
					resolve(cmslist)
				})
			})
	})
}

// * ———————————————————————————————————————————————————————— * //
// * 	get cms list
// *
// *	generates and returns the cms list
// *	@return {promise} - promise with cmslist
// * ———————————————————————————————————————————————————————— * //
pagelist_generator.prototype.get_cms_list = function () {
	const self = this
	return self.generate_cms_list()
}

// * ———————————————————————————————————————————————————————— * //
// * 	pregenerated pagelist path
// *
// * 	global acccessible pagelist path
// *	@return {promise} - promise with cmslist
// * ———————————————————————————————————————————————————————— * //
pagelist_generator.prototype.get_pregenerated_pagelist_path = function () {
	return path.join(enduro.project_path, enduro.config.build_folder, '_prebuilt', 'cmslist.json')
}

module.exports = new pagelist_generator()
