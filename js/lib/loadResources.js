'use strict'

exports.default = (component, config) => (...args) => {
	var {resources} = component,
		[req, ,next] = args
	req.component = component
	req.compositionConfig = config
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
