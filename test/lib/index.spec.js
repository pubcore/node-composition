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
			},
			'./js/index':{context_path:'/four'}
		},
		componentDefault:{
			public:true
		},
		accesscontrol:{
			allowedOrigins:['https://foo.net'],
			contentSecurityPolicy:'default-src \'self\''
		}
	},
	router = compose(config, require),
	app = express(),
	testFile = resolve(__dirname, 'node_modules', '@scope-a', 'component-one', 'index.js'),
	testFile2 = resolve(__dirname, 'js', 'lib', 'one.js')

app.use(router)
before(done => setTimeout(() => done(), 100))
describe('compose components by configuration', () => {
	after(() => {
		replace({files:testFile, from:/number two/g, to:'one'})
		replace({files:testFile2, from:/number two/g, to:'one'})
	})
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
			() => replace({files:testFile, from:/one/g, to:'number two'}).then(
				() => new Promise((res) => setTimeout(() => res(), 100)).then(
					() => request(app).get('/one/show').set('Accept', 'application/json').send().then(
						res => expect(res.text).to.contain('number two')
					)
				)
			)
		)
	)
	it('reloads modules in development mode, if corresponding js file changed', () =>
		request(app).get('/four/show').set('Accept', 'application/json').send().then(
			() => replace({files:testFile2, from:/one/g, to:'number two'}).then(
				() => new Promise((res) => setTimeout(() => res(), 100)).then(
					() => request(app).get('/four/show').set('Accept', 'application/json').send().then(
						res => expect(res.text).to.contain('number two')
					)
				)
			)
		)
	)
	it('supports CORS - CrossOriginResourceSharing by config (allowedOrigins)', () =>
		request(app).get('/one').set('Origin', 'https://foo.net').send().then(
			res => expect(res.header).to.include({
				'access-control-allow-credentials':'true',
				'access-control-allow-origin':'https://foo.net'
			})
		)
	)
	it('sends CSP - Content Security Policy header, if configured', () =>
		request(app).get('/one').send().then(
			res => expect(res.header).to.include({'content-security-policy':'default-src \'self\''})
		)
	)
	it('offers req.cookies and req.cookiesByArray object, if there are cookies', () =>
		request(app).get('/three').set('Cookie', 'foo=bar; Jwt=one; Jwt=two;').then(
			res => expect(res.text).to.include('bar').and.to.include('"Jwt":["one","two"]')
		)
	)
})
