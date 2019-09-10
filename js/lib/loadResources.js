'use strict'

exports.default = (component, config, endpoint) => (...args) => {
	var {resources} = component,
		[req, ,next] = args
	req.component = component
	req.compositionConfig = config
	req.endpointConfig = endpoint
	if(resources){
		resources(req).then(
			res => {
				req.resources = res
				next()
			},
			err => next(err)
		)
	}else{
		next()
	}
}
