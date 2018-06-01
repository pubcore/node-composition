import basicAuth from 'basic-auth'
import http401 from './http401'

export default component => (...args) => {
	//express middleware function
	var [req, ,next] = args,
		{name, pass} = basicAuth(req) || {},
		{accesscontrol} = component,
		{login, reject} = accesscontrol || {}

	if(!pass || !name){
		return reject ? reject(...args) : http401(accesscontrol)(...args)
	}
	login(name, pass).then(
		//add user data to request
		user => {
			delete user.pass //security
			req.user = user
			next()
		},
		err => next(err)
	)
}
