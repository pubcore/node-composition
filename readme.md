### HTTPS server, to map requests to functions of components
Within the terminology of HTTP we do have _requests_ and _responses_.
Given a response is just a function of a request,
this package provide the option to configure such functional mappings.

In order to structure such functions the words "component" and "composition" are
used in this way:  
A _component_ is a set of functions.  
A _composition_ is a set of components.  
A requested domain (on a specific port) is mapped to a composition.

The purpose of this package is to support such a structure by configuration.

#### Prerequisites
* latest nodejs installed
* latest npm installed
* knowledge of middleware functions of expressjs webserver

#### features
```
compose components by configuration
	✓ serves requests for configured component-one functions
	✓ serves requests for configured second "component-two"
	✓ requires a login middleware function, if component is private
	✓ reloads modules in development mode, if corresponding js file changed

component router
	✓ routes requests based on component config
	✓ support different methods for same path
	✓ checks accept header
	✓ checks http method
	✓ checks http method before login
	✓ responses "not found" for other paths
	✓ requires authentication, if component or function is not public
	✓ invokes a "login" promise for private resources
	✓ removes passwort after login, for security reasons
	✓ invokes a "resources" promise, if configured
	✓ supports error handler middleware
```
#### Example composition
Let's compose a "todo" component to manage a todo-list together with a calendar component.  
Composition's package directory consists of:

		config.js
		package.json
		server.js

1. config.js (map request to components based on context-path)

		'use strict'
		//composition config
		exports.default = {
			//a composition is a set of components ...
			components:{
				'@yourOrg/myTodoList':{
					public:true,
					context_path:'/todo'
				},
				'@yourOrg/calendar':{
					public:true,
					"context_path":'/calendar'
				}
			}
		}

2. npm's package.json  

		All component's packages used in composition are installed as dependency.  
		(On local development systems this is not required for packages which has been cloned to local, if it's directory are bound into docker container!)

3. server.js

		'use strict'
		const createComposition = require('@pubcore/node-composition').default
		const config = require('./config.js').default

		//create a composition (expressjs application)
		const composition = createComposition(config, id => require(id))

		//because composition is a express middleware function,
		//it can be used in context of any other expressjs application;
		//for instance via app.use():

		app.use('/', composition)


##### config.js options

		export default {
			componentDefault:{
				//login middleware, required, if component is not public
				login: (req, res, next) => req.user,

				//optional, function returning a promise, can be used to load
				//arbitrary data saved in req.resources
				resources: (req) => Promise

				//optional error handler middleware
				error: (err, req, res, next) => {},

				//if true, login is required
				public: false
			},
			components: {
				"@company/component-one":{
					//component ID
					id: "@company/component-one"

					//context path used for express Router
					context_path: "/basePathOfComponentOne"

					//optional to define (overwrite) defaults, see "componentDefault" ...
				}
			}
		}

### Example component
A component package exports the mapping of URI sub-path to a [express middleware function](https://expressjs.com/en/guide/using-middleware.html):

1. src/index.js

		//import express middleware functions
		import list from './lib/getList'
		import addItem from './lib/addItem'

		export default {
			public:true,
			http: [
				{
					routePath: '/list',
					map: list,
					method: 'GET',
					accepted: ['text/plain']
				},
				{
					routePath: '/list',
					map: addItem,
					method: 'POST',
					accepted: ['application/json']
				},
			]
		}

2. optional "htdocs" directory contain some static files (e.g. imgage, css, js)
