'use strict'
const one = require('./lib/one')

exports.default = {
	http:[
		{
			routePath: '/show',
			map:one,
			method: 'GET',
			accepted: ['application/json']
		}
	]
}