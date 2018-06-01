'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});
exports.app = exports.express = undefined;

var _nodeServerDocker = require('@pubcore/node-server-docker');

var _http = require('./lib/http404');

var _http2 = _interopRequireDefault(_http);

var _router = require('./lib/router');

var _router2 = _interopRequireDefault(_router);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (config, requireComponent) => {
	const { components } = config,
	      packages = Object.keys(components),
	      mapRoutePath = ({ context_path }) => ':context_path(' + context_path + ')/?';

	_nodeServerDocker.app.use(_nodeServerDocker.express.json());

	if (process.env.NODE_ENV === 'development') {
		//to prune require.cache on change; load this package only in dev-mode
		require('./lib/pruneOnChange').default(packages);
		packages.forEach(id => {
			//do "require" on request, to reload, if cache has been deleted
			_nodeServerDocker.app.use(mapRoutePath(components[id]), (...args) => (0, _router2.default)(requireComponent(id).default, _nodeServerDocker.express)(...args));
		});
	} else {
		packages.forEach(id => {
			var component = requireComponent(id).default;
			_nodeServerDocker.app.use(mapRoutePath(components[id]), (0, _router2.default)(component, _nodeServerDocker.express));
		});
	}

	//last, page not found ..
	_nodeServerDocker.app.use(_http2.default);
};

exports.express = _nodeServerDocker.express;
exports.app = _nodeServerDocker.app;