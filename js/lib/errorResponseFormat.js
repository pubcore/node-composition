'use strict';

Object.defineProperty(exports, "__esModule", {
	value: true
});

exports.default = ({ text, res }) => ({
	text: () => res.send(text),
	'application/json': () => res.send({ status: { code: 'ERROR', text } }),
	default: () => res.send(text)
});