'use strict'

module.exports = (req, res) => {
  if(!res.headersSent){
    res.status(404)
    res.send('Not found (404)')
  }
}
