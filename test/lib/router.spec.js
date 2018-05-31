import chai, {expect} from 'chai'
import chaiHttp from 'chai-http'
import express from 'express'
import router from '../../src/lib/router'

chai.use(chaiHttp)

const app = express()

const config1 = { http:[{
	routePath: '/foo',
	map: (req, res) => res.send('Hello world!'),
	method: 'GET',
	accepted: ['application/json']
}]}
app.use(router(config1, express))

describe('component router', () => {
	it('will route requests based on component config', () => {
		return chai.request(app).get('/foo').send().then(
			res => {
				expect(res).to.have.status(200)
				expect(res.text).to.contain('world')
			},
			err => {throw err}
		)
	})
	it('will check accept header', () => {
		return chai.request(app).get('/foo').set('Accept', 'foo/bar').send().then(
			res => expect(res).to.have.status(406),
			err => {throw err}
		)
	})
	it('will check http method', () => {
		return chai.request(app).post('/foo').send().then(
			res => expect(res).to.have.status(405),
			err => {throw err}
		)
	})
	it('response not found for other paths', () => {
		return chai.request(app).get('/sldl').send().then(
			res => expect(res).to.have.status(404),
			err => {throw err}
		)
	})
})
