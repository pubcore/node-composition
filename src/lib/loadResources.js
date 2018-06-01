export default component => (...args) => {
	var {resources} = component,
		[req, ,next] = args
	if(resources){
		resources().then(
			res => {
				req.resources = res
				next()
			},
			err => next(err)
		)
	}else{
		next()
	}
}
