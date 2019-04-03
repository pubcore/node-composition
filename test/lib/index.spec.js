import compose from '../../src/index'
import chai, {expect} from 'chai'
import chaiHttp from 'chai-http'
import express from 'express'
import replace from 'replace-in-file'
import {resolve} from 'path'

chai.use(chaiHttp)
process.env.NODE_ENV = 'development'
const config = {
		components:{
			'@scope-a/component-one':{ context_path:'/one' },
			'@scope-a/component-two':{ context_path:'/two' },
			'@scope-a/component-three':{
				context_path:'/three' ,
				public:false,
				login:(req, res, next) => {req.user = {}; next()}
			}
		},
		componentDefault:{
			public:true
		}
	},
	router = compose(config, require),
	app = express(),
	testFile = resolve(__dirname, 'node_modules', '@scope-a', 'component-one', 'index.js')

app.use(router)

describe('compose components by configuration', () => {
	it('serves requests for some configured component functions', () =>
		chai.request(app).get('/one/show').set('Accept', 'application/json').send().then(
			res => expect(res.text).to.contain('one')
		)
	)
	it('serves requests for configured second "component-two"', () =>
		chai.request(app).get('/two').set('Accept', 'application/json').send().then(
			res => expect(res.text).to.contain('two')
		)
	)
	it('requires a login middleware function, if component is private', () =>
		chai.request(app).get('/three').set('Accept', 'application/json').send().then(
			res => expect(res.text).to.contain('three')
		)
	)
	it('reloads modules in development mode, if corresponding js file changed', () =>
		chai.request(app).get('/one/show').set('Accept', 'application/json').send().then(
			() => replace({files:testFile, from:/one/g, to:'number one'}).then(
				() => chai.request(app).get('/one/show').set('Accept', 'application/json').send().then(
					res => expect(res.text).to.contain('number one')
				).then(
					() => replace({files:testFile, from:/number one/g, to:'one'})
				)
			)
		)
	)
})