import chokidar from 'chokidar'
import {resolve, dirname} from 'path'
//beware: only use this in development mode
//because synchonous functions must be used here ...
export default (packages, requireComponent) => {
	var {regExpressions, paths} =
		packages.reduce((agr, id) => {
			agr.paths.push(resolve(
				dirname(requireComponent.resolve(id)), '**', '*.@(js|json)')
			)
			agr.regExpressions[id] = new RegExp('[\\/\\\\]' + id + '[\\/\\\\]')
			return agr
		}, {regExpressions:{}, paths:[]}),
		watcher = chokidar.watch(paths, { usePolling:true, depth:4 })
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
