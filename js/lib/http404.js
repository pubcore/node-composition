'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

var _errorResponseFormat = require('./errorResponseFormat');

var _errorResponseFormat2 = _interopRequireDefault(_errorResponseFormat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (req, res) {
	var text = 'Not found (404)';
	res.status(404);
	res.format((0, _errorResponseFormat2.default)({ text: text, res: res }));
};