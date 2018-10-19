import loadResources from './loadResources'

export default (component, express) => {
	var router = express.Router(),
		{http, login, error} = component
	http.forEach(endpoint => {
		var {routePath, map, method, accepted} = endpoint
		router.all(routePath, loadResources(component))
		if(
			!component.public && endpoint.public === undefined
			|| !endpoint.public
		){
			router.all(routePath, login)
			router.all(routePath, (req, res, next) => {
				if(req.user){
					delete req.user.password //security
				}else{
					res.status(401).send()
				}
				next()
			})
		}
		router.all(
			routePath,
			(...args) => {
				var [req, res] = args
				return res.headersSent ? false : req.method !== method ?
					res.status(405).send()
					: !req.accepts(accepted) ?
						res.status(406).send()
						: map(...args)
			}
		)
	})
	error && router.use(error)
	return router
}
