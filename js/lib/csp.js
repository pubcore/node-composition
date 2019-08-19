'use strict'

exports.default = config => (req, res, next) => {
	var {contentSecurityPolicy} = config || {}
	if(contentSecurityPolicy) {
		res.set('Content-Security-Policy', contentSecurityPolicy)
	}
	next()
}