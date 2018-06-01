import http406 from './http406'
import http405 from './http405'
import basicAuth from './basicAuth'
import loadResources from './loadResources'

export default (component, express) => {
	var router = express.Router(),
		{http} = component
	http.forEach(endpoint => {
		var {routePath, map, method, accepted} = endpoint

		if(
			!component.public && endpoint.public === undefined
			|| !endpoint.public
		){
			router.all(routePath, basicAuth(component))
		}
		router.all(routePath, loadResources(component))
		router.all(
			routePath,
			(...args) => {
				var [req] = args
				return req.method !== method ?
					http405(...args)
					: !req.accepts(accepted) ?
						http406(...args)
						: map(...args)
			}
		)
	})
	return router
}
