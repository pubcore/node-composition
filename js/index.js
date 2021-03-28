'use strict'
const express = require('express'),
  route = require('./lib/router'),
  merge = require('merge'),
  {existsSync, accessSync, constants:{R_OK}} = require('fs'),
  {dirname, join} = require('path'),
  cors = require('./lib/cors'),
  csp = require('./lib/csp'),
  cookies = require('./lib/cookies'),
  csurf = require('csurf')

exports.default = (config, _require) => {
  const {components, componentDefault, accesscontrol, options} = config,
    {csrfProtection} = accesscontrol||{},
    {requestJsonLimit} = options||{},
    mapPath = ({context_path}) => ':context_path(' + context_path + ')/?',
    app = express(),
    mapMiddlewares = packageName => route(
      merge(
        true,
        componentDefault,
        _require(packageName).default,
        components[packageName],
        {packageName}
      ),
      config
    )

  app.use(cors(accesscontrol))
  app.use(csp(accesscontrol))
  app.use(express.json({limit: requestJsonLimit||'100kb'}))
  app.use(cookies())
  if(csrfProtection){
    app.use(csurf({cookie:{key:'__Host-Csrf-Token', secure:true, sameSite:'lax'}}))
  }

  var validPackages = Object.entries(components).reduce((acc, [id, comp]) => {
    try {
      var staticFilesPath = join( dirname(dirname(_require.resolve(id))), 'htdocs')
      //htdocs is optional; if exists, it must be readable
      if (existsSync(staticFilesPath)) {
        accessSync(staticFilesPath, R_OK)
        app.use(comp.context_path, express.static(staticFilesPath))
      }
      acc.push(id)
    } catch (e) {
      app.use(comp.context_path, (req, res) => res.status(500).send())
      console.error(e)
    }
    return acc
  }, [])

  if(process.env.NODE_ENV === 'development') {
    //to prune require.cache on change; load this package only in dev-mode
    require('./lib/pruneOnChange')(validPackages, _require)
    validPackages.forEach( packageName => { app.use(
      mapPath(components[packageName]),
      (...args) => mapMiddlewares(packageName)(...args)
    )})
  }else{
    validPackages.forEach( packageName => { app.use(
      mapPath(components[packageName]),
      mapMiddlewares(packageName)
    )})
  }

  return app
}
