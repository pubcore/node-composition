import basicAuth from 'basic-auth'
import http401 from './http401'

export default component => (...args) => {
	//express middleware function
	var [req, ,next] = args,
		{name, pass} = basicAuth(req) || {},
		{accesscontrol} = component,
		{login} = accesscontrol || {}

	if(!login && !pass || !name){
		return http401(accesscontrol)(...args)
	}
	login({...args, username:name, password:pass}).then(
		//add user data to request
		user => {
			delete user.password //security
			req.user = user
			next()
		},
		err => next(err)
	)
}
