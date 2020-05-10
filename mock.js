'use strict'

var enabled = false
//tested several mock frameworks (mock-fs, proxyquire, rewiremock, rewire)
//did not get it work in this case (mock sosme "fs" func. with runtime required modules)
//simple implementation (below) did work in 30 min. versus testing/research/troubleshooting the above taking ~ 12 hours!
const mockRequire = _require => mdl => {
  //inject behaviour to fs.accessSync function ...
  const fs = require('fs'), {accessSync} = fs
  fs.accessSync = (...args) => {
    if(enabled){
      var [filename] = args
      if(filename.match(/scope-a\/component-three\/htdocs/)){
        enabled = false
        throw new Error('simulated filesystem read permission exception')
      }
    }
    return accessSync(...args)
  }

  return _require(mdl)
}

module.exports = _require => ({
  mockRequire: mockRequire(_require),
  mockApply: func => (enabled = true) && func()
})