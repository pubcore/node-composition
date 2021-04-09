const {mockRequire, mockApply} = require('../../mock')(require),
  compose = mockRequire('../../js/index').default,
  {expect, request} = require('chai').use(require('chai-http')),
  express = require('express'),
  replace = require('replace-in-file'),
  {resolve} = require('path'),
  suppressLogs = require('mocha-suppress-logs')

before (() => {suppressLogs()})

describe('compose components by configuration', () => {
  process.env.NODE_ENV = 'development'
  const accesscontrol = {
      allowedOrigins:['https://foo.net'],
      contentSecurityPolicy:'default-src \'self\''
    },
    config = {
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
      accesscontrol
    },
    router = compose(config, require),
    app = express(),
    testFile = resolve(__dirname, 'node_modules', '@scope-a', 'component-one', 'js', 'index.js'),
    testFile2 = resolve(__dirname, 'js', 'lib', 'one.js')
  app.use(router)

  after(() => {
    replace.sync({files:testFile, from:/number two/g, to:'one'})
    replace.sync({files:testFile2, from:/number two/g, to:'one'})
  })
  it('serves requests for some configured component functions', () =>
    request(app).get('/one/show').set('Accept', 'application/json').send().then(
      res => expect(res.text).to.contain('one')
    )
  )
  it('adds "component" to request object', () =>
    request(app).get('/two/component').set('Accept', 'application/json').send().then(
      res => expect(res.body).to.have.all.keys('id', 'http', 'context_path', 'public'),
      err => {throw err}
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
    request(app).get('/three').set('Cookie', 'foo="bar"; Jwt=one; Jwt=two;').then(
      res => expect(res.text).to.include('bar').and.to.include('"Jwt":["one","two"]')
    )
  )
})

describe('compose, if validation of a component fails', () => {
  //mock fs.accessSync throwing an exception checking configured htdocs dir
  it('should skip corresponding component and response with status 500', () =>
    request(express().use(
      mockApply(() =>
        compose({components:{'@scope-a/component-three':{context_path:'/three'}}}, require)
      )
    )).get('/three').then(res => expect(res).to.have.status(500))
  )
})

describe('compose, if environment is in PRODUCTION mode', () => {
  var app, testFile
  beforeEach(() => {
    process.env.NODE_ENV = 'production'
    testFile = resolve(__dirname, 'node_modules', '@scope-a', 'component-one', 'js', 'index.js')
    //since we have one "require" cache, delete potential loaded module ...
    delete require.cache[testFile]
    replace.sync({files:testFile, from:/number two/g, to:'one'})
    app = express().use(
      compose({components:{'@scope-a/component-one':{
        resources:() => Promise.reject(new Error()),//errors in loading resources must be catched
        context_path:'/one', public:true
      }}}, require)
    )
  })
  afterEach(() => {
    process.env.NODE_ENV = 'development'
    replace.sync({files:testFile, from:/number two/g, to:'one'})
  })

  it('does not load changed module’s script file and shows same result as before', async () => {
    var {text} = await request(app).get('/one/show').set('Accept', 'application/json').send()
    expect(text).to.equal('one')
    replace.sync({files:testFile, from:/one/g, to:'number two'})
    var response = await request(app).get('/one/show').set('Accept', 'application/json').send()
    expect(response.text).to.equal('one')
  })
})
