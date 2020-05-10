'use strict'
const cookie = require('./cookieParseRepeated')

module.exports = () => (req, res, next) => {
  req.cookies = cookie.parse(req.headers.cookie || '')
  //backward compatible support of duplicate cookie names
  req.cookiesByArray = cookie.parse(req.headers.cookie || '', {parseToArray:true})
  next()
}