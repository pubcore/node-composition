'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _basicAuth = require('basic-auth');

var _basicAuth2 = _interopRequireDefault(_basicAuth);

var _http = require('./http401');

var _http2 = _interopRequireDefault(_http);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = component => (...args) => {
	//express middleware function
	var [req,, next] = args,
	    { name, pass } = (0, _basicAuth2.default)(req) || {},
	    { accesscontrol } = component,
	    { login, reject } = accesscontrol || {};

	if (!pass || !name) {
		return reject ? reject(...args) : (0, _http2.default)(accesscontrol)(...args);
	}
	login(name, pass).then(
	//add user data to request
	user => {
		delete user.pass; //security
		req.user = user;
		next();
	}, err => next(err));
};