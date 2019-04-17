const compose = require('../../js/index').default,
	{expect, request} = require('chai').use(require('chai-http')),
	express = require('express'),
	replace = require('replace-in-file'),
	{resolve} = require('path')

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
before(done => setTimeout(() => done(), 100))
describe('compose components by configuration', () => {
	after(() => replace({files:testFile, from:/number one/g, to:'one'}))
	it('serves requests for some configured component functions', () =>
		request(app).get('/one/show').set('Accept', 'application/json').send().then(
			res => expect(res.text).to.contain('one')
		)
	)
	it('serves requests for configured second "component-two"', () =>
		request(app).get('/two').set('Accept', 'application/json').send().then(
			res => expect(res.text).to.contain('two')
		)
	)
	it('requires a login middleware function, if component is private', () =>
		request(app).get('/three').set('Accept', 'application/json').send().then(
			res => expect(res.text).to.contain('three')
		)
	)
	it('reloads modules in development mode, if corresponding js file changed', () =>
		request(app).get('/one/show').set('Accept', 'application/json').send().then(
			() => replace({files:testFile, from:/one/g, to:'number one'}).then(
				() => new Promise((res) => setTimeout(() => res(), 100)).then(
					() => request(app).get('/one/show').set('Accept', 'application/json').send().then(
						res => expect(res.text).to.contain('number one')
					)
				)
			)
		)
	)
})
