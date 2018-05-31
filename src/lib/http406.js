import mapFormat from './errorResponseFormat'

export default (req, res) => {
	var text = 'Not acceptable (406)'
	res.status(406)
	res.format(mapFormat({text, res}))
}
