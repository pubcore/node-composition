import {express, app} from '@pubcore/node-server-docker'
import http404 from './lib/http404'
import mapRouter from './lib/router'
import merge from 'merge'

export default (config, requireComponent) => {
	const {components, componentDefault} = config,
		packages = Object.keys(components),
		mapRoutePath = ({context_path}) => ':context_path(' + context_path + ')/?'

	app.use(express.json())

	if(process.env.NODE_ENV === 'development') {
		//to prune require.cache on change; load this package only in dev-mode
		require('./lib/pruneOnChange').default(packages)
		packages.forEach(id => {
			//do "require" on request, to reload, if cache has been deleted
			app.use(
				mapRoutePath(components[id]),
				(...args) => mapRouter(
					merge(true, componentDefault, requireComponent(id).default),
					express
				)(...args)
			)
		})
	}else{
		packages.forEach(id => {
			var component = requireComponent(id).default
			app.use(
				mapRoutePath(components[id]),
				mapRouter(merge(true, componentDefault, component), express)
			)
		})
	}

	//last, page not found ..
	app.use(http404)
}

export {express, app}
