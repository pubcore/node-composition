'use strict'

const loadResources = require('./loadResources').default,
	express = require('express')

exports.default = (component, config) => {
	var router = express.Router(),
		{http, login, error} = component,
		methods = {GET:false, POST:false, DELETE:false, PUT:false, HEAD:false}

	http.forEach(endpoint => {
		var {routePath, map, method, accepted} = endpoint,
			verb = method.toLowerCase()
		methods[routePath] ? methods[routePath][method] = 1
			: methods[routePath] = {[method]:1}

		router.all(routePath, (...args) => {
			var [req, res, next] = args
			!res.headersSent && !methods[routePath][req.method] &&
				res.status(405).send()
			next()
		})
		router[verb](routePath, loadResources(component, config))

		if(
			!component.public && endpoint.public === undefined
			|| endpoint.public != undefined && !endpoint.public
		){
			router[verb](routePath, login)
			router[verb](routePath, (req, res, next) => {
				if(req.user){
					delete req.user.password //security
				}else{
					res.status(401).send()
				}
				next()
			})
		}

		router[verb](
			routePath,
			(...args) => {
				var [req, res] = args
				return res.headersSent ? false
					: !req.accepts(accepted) ?
						res.status(406).send()
						: map(...args)
			}
		)
	})
	error && router.use(error)
	return router
}
