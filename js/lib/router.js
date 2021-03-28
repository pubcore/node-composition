'use strict'

const loadResources = require('./loadResources'),
  express = require('express'),
  http404 = require('./http404'),
  csurf = require('csurf')

module.exports = (component, config={}) => {
  var router = express.Router(),
    methods = {GET:false, POST:false, DELETE:false, PUT:false, HEAD:false},
    {accesscontrol={}} = config,
    {http, login, error} = component

  http.forEach(endpoint => {
    var {routePath, map, method, accepted,
        urlencoded=component.urlencoded,
        csrfProtection = component.csrfProtection||accesscontrol.csrfProtection,
      } = endpoint,
      verb = method.toLowerCase()
    methods[routePath] ? methods[routePath][method] = 1
      : methods[routePath] = {[method]:1}

    //support config based middleware
    urlencoded && router[verb](routePath, express.urlencoded(urlencoded))
    csrfProtection && router[verb](routePath, csurf(csrfProtection))

    router.all(routePath, (...args) => {
      var [req, res, next] = args
      !res.headersSent && !methods[routePath][req.method] &&
        res.status(405).send()
      next()
    })
    router[verb](routePath, loadResources(component, config, endpoint))

    if(
      !component.public && endpoint.public === undefined
      || endpoint.public != undefined && !endpoint.public
    ){
      router[verb](routePath, login)
      router[verb](routePath, (req, res, next) => {
        if(req.user){
          delete req.user.password //security
        }else{
          res.status(401).send()
        }
        next()
      })
    }

    router[verb](
      routePath,
      (...args) => {
        var [req, res] = args
        return res.headersSent ? false
          : !req.accepts(accepted) ?
            res.status(406).send()
            : map(...args)
      }
    )
  })
  //last, page not found ..
  router.use(http404)
  error && router.use(error)
  return router
}
