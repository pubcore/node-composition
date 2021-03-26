## Express middleware to map requests to functions of components
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
* express application

#### Auto invalidation of require-cache in development mode
Since nodejs caches required (imported) packages, changes within a file does
not affect a running express server, it needs to be restared. This is expensive
for continuously change-save-and-review cycles web-developers love.  
This package implements __automatic invalidation of require-cache__ per
component-package level. If a script file changes, all modules of corresponding
component-package gets invalidated.

#### Features test output
```
compose components by configuration
	✓ serves requests for configured component-one functions
	✓ serves requests for configured second "component-two"
	✓ requires a login middleware function, if component is private
	✓ reloads modules in development mode, if corresponding js file changed
	✓ supports CORS - CrossOriginResourceSharing by config (allowedOrigins)
	✓ sends CSP (Content-Security-Polcy) HTTP header, if configured
	✓ offers req.cookies and req.cookiesByArray object, if there are cookies

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
	✓ supports Content-Type: application/x-www-form-urlencoded
```

#### Example composition
Let's assume we compose a todo-list component together with a calendar component.  
Composition's package directory consists of:
```
config.js
package.json
server.js
```
config.js (map request to components based on context-path)
```
//composition config
module.exports = {
	//a composition is a set of components ...
	components:{
		'@yourOrg/todo-list':{
			public: true,
			context_path: '/todo'
		},
		'@yourOrg/calendar':{
			public: true,
			context_path: '/calendar'
		}
	}
}
```
npm's package.json
```
{
	"name": "@yourScope/example-composition",
	"version": "1.0.0",
	"main": "server.js",
	"dependencies": {
		"express": "^4.17.1",
		"@pubcore/node-composition": "^2.8.0",
		"@yourScope/todo-list": "^0.1.0",
		"@yourScope/calendar": "^0.1.0",
	}
}
```
server.js
```
const
	express = require('express'),
	app = express(),
	compose = require('@pubcore/node-composition').default,
	config = require('./config.js')

app.use('/', compose(config, require))
```

###### Configuration options
```
module.exports = {
	componentDefault:{
		//if true, login (next option) is required
		public: false
		//login middleware, required, if component is not public
		login: (req, res, next) => {next()},

		//optional, build arbitrary data added to req.resources
		resources: async (req) => {}

		//optional error handler middleware
		error: (err, req, res, next) => {},

		//optional urlencoder middleware
		//see http://expressjs.com/de/api.html#express.urlencoded
		urlencoded: {extended: true}
	},
	components: {
		"@company/component-one":{
			//component ID
			id: "@company/component-one"

			//context path used for express Router
			context_path: "/basePathOfComponentOne"

			//optional to define (overwrite) defaults, see "componentDefault" ...
		}
	},
	accesscontrol:{
		//see https://developer.mozilla.org/en-US/docs/Glossary/CORS
		//CORS headers are responded for requests send from sites of following
		allowedOrigins: ["https://foo.net"],

		//see https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
		contentSecurityPolicy: "default-src 'self' data:; script-src 'self' font-src https:; style-src 'unsafe-inline' https:;"

		//Cross Site Request Forgery (SCRF) Protection by Double Submit Cookie Pattern (cookie name is: "__HOST-Csrf-Token")
		//see https://github.com/expressjs/csurf
		csrfProtection: false
	},
	//optional
	options:{
		//optional
		requestJsonLimit: '2mb' //default 100kb
	}
}
```

#### Example component
A component package exports the mapping of URI sub-path to a [express middleware function](https://expressjs.com/en/guide/using-middleware.html):

1. src/index.js
```
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
			accepted: ['application/json'],
			urlencoded: {extended: true} //optional, see above
		},
	]
}
```
2. optional "htdocs" directory contain some static files (e.g. imgage, css, js)

#### References
[CQRS protection](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
["__Host-" cookie prefix](https://tools.ietf.org/html/draft-west-cookie-prefixes-05)
