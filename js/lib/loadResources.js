'use strict'

exports.default = component => (...args) => {
	var {resources} = component,
		[req, ,next] = args
	req.component = component
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
