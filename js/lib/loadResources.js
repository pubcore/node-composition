'use strict'

module.exports = (component, config, endpoint) => (...args) => {
  var {resources} = component,
    [req, ,next] = args
  req.component = component
  req.compositionConfig = config
  req.endpointConfig = endpoint
  if(resources){
    resources(req).then(
      res => {
        req.resources = res
      },
      (err) => {
        //responsibility for loading resources is external, on error server empty object
        //no console log in PROD, since loading resources is/can be per request
        if(process.env.NODE_ENV === 'development'){
          console.error(err)
        }
        req.resources = {}
      }
    ).finally(() => next())
  }else{
    next()
  }
}
