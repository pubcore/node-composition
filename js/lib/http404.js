'use strict'

exports.default = (req, res) => {
	if(!res.headersSent){
		res.status(404)
		res.send('Not found (404)')
	}
}
