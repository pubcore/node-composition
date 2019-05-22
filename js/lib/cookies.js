'use strict'
const cookie = require('cookie')

exports.default = () => (req, res, next) => {
	req.cookies = cookie.parse(req.headers.cookie || '')
	next()
}