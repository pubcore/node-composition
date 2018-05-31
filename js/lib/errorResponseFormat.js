'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = function (_ref) {
	var _text = _ref.text,
	    res = _ref.res;
	return {
		text: function text() {
			return res.send(_text);
		},
		'application/json': function applicationJson() {
			return res.send({ status: { code: 'ERROR', text: _text } });
		},
		default: function _default() {
			return res.send(_text);
		}
	};
};