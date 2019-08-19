'use strict'
const express = require('express'),
	http404 = require('./lib/http404').default,
	route = require('./lib/router').default,
	merge = require('merge'),
	fs = require('fs'),
	cors = require('./lib/cors').default,
	csp = require('./lib/csp').default,
	cookies = require('./lib/cookies').default

exports.default = (config, requireComponent) => {
	const {components, componentDefault, accesscontrol} = config,
		packages = Object.keys(components),
		mapPath = ({context_path}) => ':context_path(' + context_path + ')/?',
		app = express()

	app.use(cors(accesscontrol))
	app.use(csp(accesscontrol))
	app.use(express.json())
	app.use(cookies())
	
	packages.forEach(id => {
		var staticFilesPath = './node_modules/' + id + '/htdocs'
		try {
			if (fs.existsSync(staticFilesPath)) { app.use(
				components[id].context_path,
				express.static(staticFilesPath)
			)}
		} catch(err) {
			//static files are optional
			// eslint-disable-next-line no-console
			console.log(`No static-files support for ${id} ("htdocs" directory not found)`)
		}
	})

	if(process.env.NODE_ENV === 'development') {
		//to prune require.cache on change; load this package only in dev-mode
		require('./lib/pruneOnChange').default(packages, requireComponent)
		packages.forEach( id => { app.use(
			mapPath(components[id]),
			(...args) => route(
				//do "require" on request, to reload, if cache has been deleted
				merge(true, componentDefault, requireComponent(id).default, components[id], {id}),
				config
			)(...args)
		)})
	}else{
		packages.forEach( id => { app.use(
			mapPath(components[id]),
			route(
				merge(true, componentDefault, requireComponent(id).default, components[id], {id}),
				config
			)
		)})
	}

	//last, page not found ..
	app.use(http404)
	return app
}
