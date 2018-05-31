import http406 from './http406'
import http405 from './http405'

export default (component, express) => {
	var router = express.Router(),
		{http} = component
	http.forEach(endpoint => {
		var {routePath, map, method, accepted} = endpoint
		
		router.all(
			routePath,
			(req, res, next) => {
				return req.method !== method ?
					http405(req, res)
					: !req.accepts(accepted) ?
						http406(req, res)
						: map(req, res, next)
			}
		)
	})
	return router
}
