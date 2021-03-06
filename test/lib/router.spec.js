'use strict'

const {expect, request} = require('chai').use(require('chai-http')),
  express = require('express'),
  cookies = require('../../js/lib/cookies'),
  router = require('../../js/lib/router'),
  http404 = require('../../js/lib/http404'),
  suppressLogs = require('mocha-suppress-logs')

before (() => {suppressLogs()})

const app = express(),
  error = err => {throw err},
  app2 = express(),
  app3 = express(),
  app4 = express(),
  app5 = express()

const config1 = { http:[
    {
      routePath: '/foo',
      map: (req, res) => res.send(
        `Hello world! ${JSON.stringify([req.user, req.resources])}`
      ),
      method: 'GET',
      accepted: ['application/json'],
      public:true
    },
    {
      routePath: '/foo',
      map: (req, res) => res.send('POST succeeded'),
      method: 'POST',
      accepted: ['application/json'],
      public:true
    },
    {
      routePath: '/error',
      map: (req, res, next) => {next('err')},
      method: 'GET',
      accepted: ['application/json'],
      public:true
    }
  ]},
  config2 = {
    error: (err, req, res, next) => next && res.send('error-callback'),
    login: (req, res, next) => new Promise(resolve => resolve(
      req.headers.authorization ?
        req.user = {username:'test-username', password:'pwxyz'}
        : null
    )).then(() => next(), err => next(err)),
    resources: () => new Promise(res => res({foo:'bar'})),
    http:[{...config1.http[0], 'public':false},{...config1.http[2]},
      {
        routePath: '/',
        map: (req, res) => res.send('POST succeeded'),
        method: 'POST',
        accepted: ['application/json'],
        public:false
      }]
  },
  config3 = {
    error: (err, req, res, next) => next && res.send('error-callback'),
    login: (req, res, next) => new Promise(resolve => resolve(
      req.headers.authorization ?
        req.user = {username:'test-username', password:'pwxyz'}
        : null
    )).then(() => next(), err => next(err)),
    resources: req => new Promise(res => res({config: req.compositionConfig})),
    http:[{...config1.http[0], 'public':false},{...config1.http[2]},
      {
        routePath: '/',
        map: (req, res) => res.send('POST succeeded'),
        method: 'POST',
        accepted: ['application/json'],
        public:false
      },
      {
        routePath: '/loadResourcesError',
        map: (req, res) => res.send(req.resources),
        method: 'GET',
        accepted: ['application/json'],
        public: true
      }]
  },
  config4 = {
    urlencoded: {extended: true},
    http:[
      {
        routePath: '/urlencoded',
        map: (req, res) => res.send(req.body),
        method: 'POST',
        accepted: ['application/json'],
        public:true
      },
      {
        routePath: '/urlencoded_off',
        map: (req, res) => res.send(req.body),
        method: 'POST',
        accepted: ['application/json'],
        public:true,
        urlencoded: null,
      }
    ]}

app.use(router(config1))
app2.use(router(config2))
app2.use(http404)
app3.use(router(config3, {foo:'bar'})),
app4.use(router({...config3, resources:() => Promise.reject(new Error())})),
app5.use(router({...config4}))

describe('component router', () => {
  it('routes requests based on component config', () => {
    return request(app).get('/foo').send().then(
      res => {
        expect(res).to.have.status(200)
        expect(res.text).to.contain('world')
      }, error
    )
  })
  it('support different methods for same path', () => {
    return request(app).post('/foo').send().then(
      res => {
        expect(res).to.have.status(200)
        expect(res.text).to.contain('POST succeeded')
      }, error
    )
  })
  it('checks accept header', () => {
    return request(app).get('/foo').set('Accept', 'foo/bar').send().then(
      res => expect(res).to.have.status(406), error
    )
  })
  it('checks http method', () => {
    return request(app).put('/foo').send().then(
      res => expect(res).to.have.status(405), error
    )
  })
  it('checks http method before login', () => {
    return request(app2).put('/').send().then(
      res => expect(res).to.have.status(405), error
    )
  })
  it('responses "not found" for other paths', () => {
    return request(app).get('/sldl').send().then(
      res => expect(res).to.have.status(404), error
    )
  })
  it('requires authentication, if component or function is not public', () => {
    return request(app2).get('/foo').send().then(
      res => expect(res).to.have.status(401), error
    )
  })
  it('invokes a "login" promise for private resources', () => {
    return request(app2).get('/foo').auth('test-username', 'p').send().then(
      res => expect(res.text).to.contain('test-username')
    )
  })
  it('removes passwort after login, for security reasons', () => {
    return request(app2).get('/foo').auth('test-username', 'pwxyz').send().then(
      res => expect(res.text).to.contain('test-username').and.not.contain('pwxyz')
    )
  })
  it('invokes a "resources" promise, if configured', () => {
    return request(app2).get('/foo').auth('u', 'p').send().then(
      res => expect(res.text).to.contain('"foo":"bar"')
    )
  })
  it('invokes a "resources" promise, if configured and use config data', () => {
    return request(app3).get('/foo').auth('u', 'p').send().then(
      res => expect(res.text).to.contain('"foo":"bar"')
    )
  })
  it('it catches up failed "resources" promise', () => {
    return request(app4).get('/loadResourcesError').send().then(
      res => expect(res.text).to.contain('{}')
    )
  })
  it('supports error handler middleware', () => {
    return request(app2).get('/error').send().then(
      res => expect(res.text).to.contain('error-callback')
    )
  })
  it('supports Content-Type: application/x-www-form-urlencoded', () => {
    return request(app5).post('/urlencoded').set({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }).send('foo=bar').then(
      res => expect(res.body).to.eql({foo:'bar'})
    )
  })
  it('supports to turn off "urlencoded" middleware endpoint specific', () => {
    return request(app5).post('/urlencoded_off').set({
      'Accept': 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded'
    }).send('foo=bar').then(
      res => expect(res.body).to.eql({})
    )
  })

  describe('Cross Site Request Forgery protection', () => {
    var endpoint = {
        routePath: '/',
        //the app is responsible to handle the token, so we simulate it in next line
        map: (req, res) => res.cookie('__Host-Csrf-Token', req.csrfToken()).send(),
        method: 'GET',
        public: true,
        urlencoded:{extended:false}//required, if token is send via form post/puts as part of the request body
      },
      createApp = () => express().use(cookies(), router(
        { http:[
          endpoint,
          {...endpoint, method:'POST'},
          {...endpoint,
            method:'POST', routePath: '/public', csrfProtection:null,
            map: (req, res) => res.send()
          }
        ] },
        {
          accesscontrol:{
            csrfProtection:{
              cookie: {key:'__Host-Csrf', secure:true, sameSite:'lax', httpOnly:true}
            }
          }
        }
      )),
      parseCookie = cookieString => cookieString.match(/[^=]+=([^;]+);/)[1]

    it('response a session-secret cookie, based on config)', () =>
      request(createApp()).get('/').send().then(res =>
        expect(res).to.have.header('Set-Cookie', /__Host-Csrf/)
      )
    )
    it('serves 403, if token is invalid', () =>
      request(createApp()).post('/').send().then(res =>
        expect(res).to.have.status(403)
      )
    )
    it('accepts valid token send by form hidden field "_csrf"', () =>
      request(createApp()).get('/').send().then(
        //pick the two "Double Submit Cookie" Cookies from the response
        ({headers:{'set-cookie':cookies}}) =>
          request(createApp()).post('/').set('Cookie', `__Host-Csrf=${parseCookie(cookies[0])}`)
            .type('form').send({_csrf:parseCookie(cookies[1])}).then(res =>
              expect(res).to.have.status(200))
      )
    )
    it('allowes to disable CSRF per endpoint', () =>
      request(createApp()).post('/public').send().then(res =>
        expect(res).to.have.status(200)
      )
    )
  })
})
