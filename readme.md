### HTTPS server, to map requests to functions of components
Within the terminology of HTTP we do have _requests_ and _responses_.
Given a response is just the value of a function of the corresponding request,
this package provide the option to configure such functional mappings.

In order to structure such functions the words "component" and "composition" are
used in this way:  
A _component_ is a set of functions.  
A _composition_ is a set of components.  
A requested domain (on a specific port) is mapped to a composition.

The purpose of this package is to support such a structure by configuration.

#### Prerequisites
* Latest release of docker installed and running
* Knowledge how to compose stacks of docker containers
* Web-server configuration done (see @pubcore/node-server-docker)

#### Content of composition's package directory
A composition is a package consists of several configuration files.
Beside the webserver's yaml and config files (see prerequisites), there are 3 importand files:  

		config.json
		package.json
		server.js

#### Example composition
Let's compose a "todo" component to manage a todo-list together with a calendar component:

1. config.json (map request to components based on context-path)

		{
			"components":{
				"@yourOrg/myTodoList":{
					"context_path":"/todo"
				},
				"@yourOrg/calendar":{
					"context_path":"/calendar"
				}
			}
		}

2. npm's package.json  
	All component's packages used in composition are installed as dependency. On local development systems this is not required for packages which has been cloned to local and it's parent directory are bound into docker container!

3. server.js

		'use strict'
		const mapComposition = require('@pubcore/node-composition').default

		mapComposition(require('./config.json'), id => require(id))

A component package exports the mapping of URI sub-path to a [express middleware function](https://expressjs.com/en/guide/using-middleware.html):

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
