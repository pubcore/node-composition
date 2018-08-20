import chai, {expect} from 'chai'
import chaiHttp from 'chai-http'
import express from 'express'
import router from '../../src/lib/router'

chai.use(chaiHttp)

const app = express(),
	error = err => {throw err},
	app2 = express()

const config1 = { http:[{
		routePath: '/foo',
		map: (req, res) => res.send(
			`Hello world! ${JSON.stringify([req.user, req.resources])}`
		),
		method: 'GET',
		accepted: ['application/json'],
		public:true
	}]},
	config2 = {
		login: (req, res, next) => new Promise(resolve => resolve(
			req.headers.authorization ?
				req.user = {username:'test-username', password:'pwxyz'}
				: null
		)).then(() => next(), err => next(err)),
		resources: () => new Promise(res => res({foo:'bar'})),
		http:[{...config1.http[0], 'public':false}]
	}
app.use(router(config1, express))
app2.use(router(config2, express))

describe('component router', () => {
	it('routes requests based on component config', () => {
		return chai.request(app).get('/foo').send().then(
			res => {
				expect(res).to.have.status(200)
				expect(res.text).to.contain('world')
			}, error
		)
	})
	it('checks accept header', () => {
		return chai.request(app).get('/foo').set('Accept', 'foo/bar').send().then(
			res => expect(res).to.have.status(406), error
		)
	})
	it('checks http method', () => {
		return chai.request(app).post('/foo').send().then(
			res => expect(res).to.have.status(405), error
		)
	})
	it('responses "not found" for other paths', () => {
		return chai.request(app).get('/sldl').send().then(
			res => expect(res).to.have.status(404), error
		)
	})
	it('requires authentication, if component or function is not public', () => {
		return chai.request(app2).get('/foo').send().then(
			res => expect(res).to.have.status(401), error
		)
	})
	it('invokes a "login" promise for private resources', () => {
		return chai.request(app2).get('/foo').auth('test-username', 'p').send().then(
			res => expect(res.text).to.contain('test-username')
		)
	})
	it('removes passwort after login, for security reasons', () => {
		return chai.request(app2).get('/foo').auth('test-username', 'pwxyz').send().then(
			res => expect(res.text).to.contain('test-username').and.not.contain('pwxyz')
		)
	})
	it('invokes a "resources" promise, if configured', () => {
		return chai.request(app2).get('/foo').auth('u', 'p').send().then(
			res => expect(res.text).to.contain('"foo":"bar"')
		)
	})
})
