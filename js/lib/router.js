'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _http = require('./http406');

var _http2 = _interopRequireDefault(_http);

var _http3 = require('./http405');

var _http4 = _interopRequireDefault(_http3);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (component, express) {
	var router = express.Router(),
	    http = component.http;

	http.forEach(function (endpoint) {
		var routePath = endpoint.routePath,
		    map = endpoint.map,
		    method = endpoint.method,
		    accepted = endpoint.accepted;


		router.all(routePath, function (req, res, next) {
			return req.method !== method ? (0, _http4.default)(req, res) : !req.accepts(accepted) ? (0, _http2.default)(req, res) : map(req, res, next);
		});
	});
	return router;
};