'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _http = require('./http406');

var _http2 = _interopRequireDefault(_http);

var _http3 = require('./http405');

var _http4 = _interopRequireDefault(_http3);

var _basicAuth = require('./basicAuth');

var _basicAuth2 = _interopRequireDefault(_basicAuth);

var _loadResources = require('./loadResources');

var _loadResources2 = _interopRequireDefault(_loadResources);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (component, express) => {
	var router = express.Router(),
	    { http } = component;
	http.forEach(endpoint => {
		var { routePath, map, method, accepted } = endpoint;

		if (!component.public && endpoint.public === undefined || !endpoint.public) {
			router.all(routePath, (0, _basicAuth2.default)(component));
		}
		router.all(routePath, (0, _loadResources2.default)(component));
		router.all(routePath, (...args) => {
			var [req] = args;
			return req.method !== method ? (0, _http4.default)(...args) : !req.accepts(accepted) ? (0, _http2.default)(...args) : map(...args);
		});
	});
	return router;
};