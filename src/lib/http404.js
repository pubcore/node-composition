import mapFormat from './errorResponseFormat'

export default (req, res) => {
	var text = 'Not found (404)'
	res.status(404)
	res.format(mapFormat({text, res}))
}
