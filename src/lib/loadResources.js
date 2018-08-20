export default component => (...args) => {
	var {resources} = component,
		[req, ,next] = args
	req.component = component
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
