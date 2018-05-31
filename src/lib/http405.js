import mapFormat from './errorResponseFormat'

export default (req, res) => {
	var text = 'Method not allowed (405)'
	res.status(405)
	res.format(mapFormat({text, res}))
}
