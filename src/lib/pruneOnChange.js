import chokidar from 'chokidar'
import  {dirname, resolve} from 'path'
//beware: only use this in development mode
//because synchonous functions must be used here ...
export default (packages, requireComponent) => {
	var {regExpressions, paths} =
		packages.reduce((agr, id) => {
			agr.paths.push(
				resolve(dirname(requireComponent.resolve(id)), '**', '*.@(js|json)')
					//chokidar paths with globs only support usage of slash
					.replace(/\\/g, '/')
			)
			agr.regExpressions[id] = new RegExp(id.replace(/\//, '[/\\\\]'))
			return agr
		}, {regExpressions:{}, paths:[]}),
		watcher = chokidar.watch(paths, {depth:4})
	logSynchronousUsageWarning(paths)
	watcher.on('ready', () => {watcher.on('all', () => {
		var reload = {}
		Object.keys(require.cache).forEach(id => {
			Object.keys(regExpressions).forEach(componentId => {
				if(regExpressions[componentId].test(id)){
					delete require.cache[id]
					reload[componentId] = true
				}
			})
		})
		Object.keys(reload).forEach(compId => logSynchronousUsageWarning(compId))
	})})
	// eslint-disable-next-line no-console
	watcher.on('error', error => console.warn(`Watcher error: ${error}`))
}

const logSynchronousUsageWarning = compId => {
	// eslint-disable-next-line no-console
	console.warn(`dev-mode: synchronous reload for ${compId}`)
}
