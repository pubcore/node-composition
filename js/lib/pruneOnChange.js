'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _chokidar = require('chokidar');

var _chokidar2 = _interopRequireDefault(_chokidar);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

//beware: only use this in development mode
//because synchonous functions must be used here ...
exports.default = function (packages) {
	var _packages$reduce = packages.reduce(function (agr, id) {
		agr.paths.push('./node_modules/' + id + '/js/*.js');
		agr.regExpressions[id] = new RegExp('[\\/\\\\]' + id + '[\\/\\\\]');
		return agr;
	}, { regExpressions: {}, paths: [] }),
	    regExpressions = _packages$reduce.regExpressions,
	    paths = _packages$reduce.paths,
	    watcher = _chokidar2.default.watch(paths, { usePolling: true, depth: 4 });

	logSynchronousUsageWarning('main process');
	watcher.on('ready', function () {
		watcher.on('all', function () {
			var reload = {};
			Object.keys(require.cache).forEach(function (id) {
				Object.keys(regExpressions).forEach(function (componentId) {
					if (regExpressions[componentId].test(id)) {
						delete require.cache[id];
						reload[componentId] = true;
					}
				});
			});
			Object.keys(reload).forEach(function (compId) {
				return logSynchronousUsageWarning(compId);
			});
		});
	});
	// eslint-disable-next-line no-console
	watcher.on('error', function (error) {
		return console.warn('Watcher error: ' + error);
	});
};

var logSynchronousUsageWarning = function logSynchronousUsageWarning(compId) {
	// eslint-disable-next-line no-console
	console.warn('============================================================');
	// eslint-disable-next-line no-console
	console.warn('dev-mode: synchronous reload enabled in ' + compId);
};