## 2.12.0 2021-01-13
* add flag (csrfProtection) to enable SCRF Protection by Double Submit Cookie

## 2.11.0 2020-05-10
* skip invalid components, log error and serve 500 if requested
* set ```req.resources={}```, if resources promise rejects (log error in dev mode)
* add optional ```options.requestJsonLimit``` (defaults to '100kb')

## 2.9.0 2020-01-26
* support usage as dev-dependency of component packages
* add compositionConfig to request object
* add endpointConfig to request object

## 2.6.0 2019-07-16
* add req.cookiesByArray object to support duplicate cookie names

## 2.5.0 2019-05-22
* add req.cookies object, if request cookies exists

## 2.4.0 2019-05-17
* add Content Security Policy (CSP) support
* add Cross Origin Resource Sharing (CORS) support
* remove transpile step (reduce dependencies)

## 2.1.0 2019-02-20
* merge global, component-sepcific config into component object (overwrites default)

## 2.0.0 2019-02-09
* change api: only express app (middleware function) is exported now
* remove dependency to @pubcore/node-server-docker
* update docs

## 1.8.0 2019-02-08
* forward request object to optional "resources" function

## 1.6.0 2018-10-24
* add support of static files by optional component's htdocs directory

## 1.5.0 2018-10-19
* add optional error handler middleware
* add documentation

## 1.3.0 2018-07-04
* private components: remove reject callback
* private components: login callback is required, if u-name or password is given

## 1.2.0 2018-06-01
* introduced config property "componentDefault"

## 1.1.0 2018-06-01
* added support for private components via new "public" property of component config.
* added option to load custom resources via new "resources" property of component config.
