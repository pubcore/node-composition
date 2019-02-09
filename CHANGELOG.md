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
