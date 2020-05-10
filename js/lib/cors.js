'use strict'
const cors = require('cors')

module.exports = config => cors((req, callback) => {
  var origin = req.header('Origin'),
    {allowedOrigins} = config || {}
  callback(null, {
    origin: (allowedOrigins||[]).indexOf(origin) !== -1 || !origin,
    methods: ['GET','PUT','POST','DELETE','HEAD','PATCH'],
    credentials: true,
    maxAge: 86400,
    preflightContinue: false
  })
})